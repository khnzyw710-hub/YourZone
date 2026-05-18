import React, { useState, useEffect } from 'react';
import { Platform, StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { SuperAIOrchestrator, AgentTask } from './SuperAIOrchestrator';

const orchestrator = new SuperAIOrchestrator("nexus");
const { width } = Dimensions.get('window');

export default function App() {
  const [input, setInput] = useState('');
  const [tasksState, setTasksState] = useState<AgentTask[]>([]);
  const [consoleLog, setConsoleLog] = useState<string[]>(['System Nexus initialized. Air-gapped pipeline secure.']);
  const [isAwake, setIsAwake] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      orchestrator.startUltraLowPowerListening(() => {
        setIsAwake(true);
        logToConsole("⚡ Wake word triggered locally. Core Orchestrator engaged.");
      });
    }
  }, []);

  const logToConsole = (msg: string) => {
    setConsoleLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const triggerSwarmExecution = async () => {
    if (!input.trim()) return;

    logToConsole(`Parsing swarm matrix for prompt: "${input}"`);
    const pipelinePlan = orchestrator.planComplexExecution(input);
    setTasksState(pipelinePlan);
    setInput('');

    const executionResults = await orchestrator.executeSwarm(pipelinePlan, (updatedTasks) => {
      setTasksState([...updatedTasks]);
    });

    logToConsole("✅ Swarm execution completed. Synthesizing cross-model payloads.");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top HUD */}
      <View style={styles.hudHeader}>
        <Text style={styles.hudTitle}>NEXUS // <Text style={{ color: '#00E5FF' }}>MATRIX v3.0</Text></Text>
        <View style={[styles.pulseDot, { backgroundColor: isAwake ? '#00FF66' : '#FF0055' }]} />
      </View>

      {/* Swarm Monitor Grid */}
      <Text style={styles.sectionLabel}>SWARM AGENT REAL-TIME MONITOR</Text>
      <View style={styles.gridContainer}>
        {tasksState.map((task) => (
          <View key={task.id} style={[styles.agentCard, styles[task.status as keyof typeof styles] as any || styles.pending]}>
            <Text style={styles.agentModel}>{task.model}</Text>
            <Text style={styles.agentId}>{task.id.toUpperCase()}</Text>
            <Text style={styles.agentStatusText}>{task.status}</Text>
          </View>
        ))}
      </View>

      {/* Real-time System Console */}
      <Text style={styles.sectionLabel}>KERNEL SYSTEM LOGS</Text>
      <ScrollView style={styles.consoleView} contentContainerStyle={{ paddingBottom: 10 }}>
        {consoleLog.map((log, index) => (
          <Text key={index} style={styles.consoleText}>{log}</Text>
        ))}
      </ScrollView>

      {/* Cyber Input Field */}
      <View style={styles.actionWrapper}>
        <TextInput
          style={styles.terminalInput}
          value={input}
          onChangeText={setInput}
          placeholder="Execute multi-model quantum command..."
          placeholderTextColor="#3A3A4A"
          onSubmitEditing={triggerSwarmExecution}
        />
        <TouchableOpacity style={styles.executeBtn} onPress={triggerSwarmExecution}>
          <Text style={styles.btnText}>ENGAGE</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const cardWidth = Platform.OS === 'web'
  ? Math.min(width, 600) / 2 - 22
  : (width - 44) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050508',
    paddingHorizontal: 16,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  hudHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginVertical: 20 },
  hudTitle: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 3 },
  pulseDot: { width: 10, height: 10, borderRadius: 5, shadowColor: '#00FF66', shadowRadius: 8, shadowOpacity: 0.8 },
  sectionLabel: { color: '#4A4A5A', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8, textAlign: 'right' },
  gridContainer: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  agentCard: { width: cardWidth, padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 10, alignItems: 'flex-end' },
  agentModel: { color: '#FFF', fontSize: 14, fontWeight: '800' },
  agentId: { color: '#6A6A7A', fontSize: 10, marginTop: 2 },
  agentStatusText: { fontSize: 11, fontWeight: '700', marginTop: 8, textTransform: 'uppercase' },
  pending: { backgroundColor: '#101015', borderColor: '#222230', opacity: 0.5 },
  processing: { backgroundColor: '#112233', borderColor: '#00E5FF' },
  completed: { backgroundColor: '#113322', borderColor: '#00FF66' },
  failed: { backgroundColor: '#331111', borderColor: '#FF0055' },
  consoleView: { flex: 1, backgroundColor: '#020204', borderRadius: 6, borderWidth: 1, borderColor: '#12121A', padding: 12, marginBottom: 20 },
  consoleText: { color: '#00FF66', fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier', fontSize: 12, marginBottom: 6, textAlign: 'left' },
  actionWrapper: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 15 },
  terminalInput: { flex: 1, backgroundColor: '#09090F', borderWidth: 1, borderColor: '#1A1A26', borderRadius: 8, padding: 14, color: '#00E5FF', fontSize: 15, textAlign: 'right' },
  executeBtn: { backgroundColor: '#00E5FF', paddingVertical: 15, paddingHorizontal: 18, borderRadius: 8, marginRight: 10 },
  btnText: { color: '#000', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
});
