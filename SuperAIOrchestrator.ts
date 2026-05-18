import { Platform } from 'react-native';
import axios from 'axios';

export type AIModel = 'GPT-4o' | 'Claude-3.5-Sonnet' | 'Gemini-1.5-Pro' | 'Sora' | 'Suno/Udio' | 'Flux-Dev';

export interface AgentTask {
  id: string;
  model: AIModel;
  payload: string;
  dependencies: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
}

export class SuperAIOrchestrator {
  private wakeWord: string;
  private isListening: boolean = false;

  constructor(wakeWord: string = "nexus") {
    this.wakeWord = wakeWord.toLowerCase();
  }

  public planComplexExecution(userPrompt: string): AgentTask[] {
    const prompt = userPrompt.toLowerCase();
    const tasks: AgentTask[] = [];

    if (prompt.includes('קוד') || prompt.includes('אפליקציה') || prompt.includes('code')) {
      tasks.push({
        id: 'task_code',
        model: 'Claude-3.5-Sonnet',
        payload: `Generate production-grade optimization for: ${userPrompt}`,
        dependencies: [],
        status: 'pending'
      });
    }

    if (prompt.includes('ניתוח') || prompt.includes('דוח') || prompt.includes('חקר')) {
      tasks.push({
        id: 'task_analytics',
        model: 'Gemini-1.5-Pro',
        payload: `Perform deep context analysis on: ${userPrompt}`,
        dependencies: [],
        status: 'pending'
      });
    }

    if (prompt.includes('קליפ') || prompt.includes('וידאו') || prompt.includes('סרטון')) {
      tasks.push({
        id: 'task_script',
        model: 'GPT-4o',
        payload: `Write a cinematic scene script based on: ${userPrompt}`,
        dependencies: [],
        status: 'pending'
      });
      tasks.push({
        id: 'task_video',
        model: 'Sora',
        payload: `Generate high-fidelity video matching the script from task_script`,
        dependencies: ['task_script'],
        status: 'pending'
      });
    }

    if (tasks.length === 0) {
      tasks.push({
        id: 'task_core',
        model: 'GPT-4o',
        payload: userPrompt,
        dependencies: [],
        status: 'pending'
      });
    }

    return tasks;
  }

  public async executeSwarm(tasks: AgentTask[], onProgress: (updatedTasks: AgentTask[]) => void): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    while (tasks.some(t => t.status === 'pending' || t.status === 'processing')) {
      const executableTasks = tasks.filter(t =>
        t.status === 'pending' &&
        t.dependencies.every(depId => results[depId] !== undefined)
      );

      if (executableTasks.length === 0 && tasks.some(t => t.status === 'processing')) {
        await new Promise(resolve => setTimeout(resolve, 200));
        continue;
      }

      const promises = executableTasks.map(async (task) => {
        task.status = 'processing';
        onProgress([...tasks]);

        let finalPayload = task.payload;
        task.dependencies.forEach(depId => {
          finalPayload += `\n[Context from dependent task ${depId}]: ${JSON.stringify(results[depId])}`;
        });

        try {
          const response = await axios.post('https://api.nexus-core.io/v2/swarm/execute', {
            model: task.model,
            payload: finalPayload,
            sessionToken: "SECURE_EPHEMERAL_TOKEN"
          }, { timeout: 60000 });

          task.status = 'completed';
          task.result = response.data.output;
          results[task.id] = response.data.output;
        } catch (error) {
          task.status = 'failed';
          results[task.id] = `Agent execution failed for ${task.model}`;
        }
        onProgress([...tasks]);
      });

      await Promise.all(promises);
    }

    return results;
  }

  // Web-safe wake word listening — audio recording is native-only
  public async startUltraLowPowerListening(onWake: () => void): Promise<void> {
    if (Platform.OS === 'web') {
      // Voice wake word not supported in browser; silently skip
      return;
    }

    try {
      const { Audio } = await import('expo-av');
      const recording = new Audio.Recording();

      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const lowPowerConfig = {
        android: { extension: '.amr', sampleRate: 8000, numberOfChannels: 1, bitRate: 12200 },
        ios: { extension: '.wav', sampleRate: 8000, numberOfChannels: 1, linearPCMBitDepth: 16, linearPCMIsBigEndian: false, linearPCMIsFloat: false }
      };

      await recording.prepareToRecordAsync(lowPowerConfig as any);
      this.isListening = true;
      await recording.startAsync();

      recording.setOnRecordingStatusUpdate((status) => {
        if (status.metering !== undefined && status.metering > -20) {
          if (this.isListening) {
            this.isListening = false;
            onWake();
          }
        }
      });
    } catch (e) {
      console.error("Hardware listening initialization failed", e);
    }
  }
}
