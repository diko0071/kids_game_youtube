import { useCallback } from 'react'

export function useGameAudio() {
  const playSound = useCallback((frequency: number, duration: number) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01)
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration - 0.01)

    oscillator.start()
    oscillator.stop(audioContext.currentTime + duration)
  }, [])

  const playHappySound = useCallback(() => {
    playSound(523.25, 0.2) // C5
    setTimeout(() => playSound(659.25, 0.2), 200) // E5
    setTimeout(() => playSound(783.99, 0.3), 400) // G5
  }, [playSound])

  const playSadSound = useCallback(() => {
    playSound(392.00, 0.3) // G4
    setTimeout(() => playSound(349.23, 0.3), 300) // F4
  }, [playSound])

  return { playHappySound, playSadSound }
}