/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { create } from 'zustand';
import {
  Agent,
  Charlotte,
  Paul,
  Shane,
  Penny,
  TheHatter,
} from './presets/agents';

/**
 * User
 */
export type User = {
  name?: string;
  info?: string;
};

export const useUser = create<
  {
    setName: (name: string) => void;
    setInfo: (info: string) => void;
  } & User
>(set => ({
  name: '',
  info: '',
  setName: name => set({ name }),
  setInfo: info => set({ info }),
}));

/**
 * Agents
 */

const PERSONAL_AGENTS_STORAGE_KEY = 'tea-time-personal-agents';

function loadPersonalAgents(): Agent[] {
  try {
    const stored = localStorage.getItem(PERSONAL_AGENTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load personal agents from localStorage', e);
  }
  return [];
}

function savePersonalAgents(agents: Agent[]) {
  try {
    localStorage.setItem(PERSONAL_AGENTS_STORAGE_KEY, JSON.stringify(agents));
  } catch (e) {
    console.error('Failed to save personal agents to localStorage', e);
  }
}

function getAgentById(id: string) {
  const { availablePersonal, availablePresets } = useAgent.getState();
  return (
    availablePersonal.find(agent => agent.id === id) ||
    availablePresets.find(agent => agent.id === id)
  );
}

export const useAgent = create<{
  current: Agent;
  availablePresets: Agent[];
  availablePersonal: Agent[];
  setCurrent: (agent: Agent | string) => void;
  addAgent: (agent: Agent) => void;
  update: (agentId: string, adjustments: Partial<Agent>) => void;
}>(set => ({
  current: TheHatter,
  availablePresets: [TheHatter, Paul, Charlotte, Shane, Penny],
  availablePersonal: loadPersonalAgents(),

  addAgent: (agent: Agent) => {
    set(state => {
      const newPersonalAgents = [...state.availablePersonal, agent];
      savePersonalAgents(newPersonalAgents);
      return {
        availablePersonal: newPersonalAgents,
        current: agent,
      };
    });
  },
  setCurrent: (agent: Agent | string) =>
    set({ current: typeof agent === 'string' ? getAgentById(agent) : agent }),
  update: (agentId: string, adjustments: Partial<Agent>) => {
    const agent = getAgentById(agentId);
    if (!agent) return;
    const updatedAgent = { ...agent, ...adjustments };
    set(state => {
      const newPersonalAgents = state.availablePersonal.map(a =>
        a.id === agentId ? updatedAgent : a
      );

      // Only save if the updated agent is a personal one.
      if (state.availablePersonal.some(a => a.id === agentId)) {
        savePersonalAgents(newPersonalAgents);
      }

      return {
        availablePresets: state.availablePresets.map(a =>
          a.id === agentId ? updatedAgent : a
        ),
        availablePersonal: newPersonalAgents,
        current: state.current.id === agentId ? updatedAgent : state.current,
      };
    });
  },
}));

/**
 * UI
 */
export const useUI = create<{
  showUserConfig: boolean;
  setShowUserConfig: (show: boolean) => void;
  showAgentEdit: boolean;
  setShowAgentEdit: (show: boolean) => void;
}>(set => ({
  showUserConfig: true,
  setShowUserConfig: (show: boolean) => set({ showUserConfig: show }),
  showAgentEdit: false,
  setShowAgentEdit: (show: boolean) => set({ showAgentEdit: show }),
}));
