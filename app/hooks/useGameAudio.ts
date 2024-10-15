import { useCallback } from 'react'

export function useGameAudio() {
  const playSound = useCallback((frequency: number, duration: number): Promise<void> => {
    return new Promise((resolve) => {
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

      setTimeout(resolve, duration * 1000)
    })
  }, [])

  const playHappySound = useCallback(async () => {
    await playSound(523.25, 0.2)
    await playSound(659.25, 0.2)
    await playSound(783.99, 0.3)
  }, [playSound])

  const playSadSound = useCallback(async () => {
    await playSound(392.00, 0.3)
    await playSound(349.23, 0.3)
  }, [playSound])

  return { playHappySound, playSadSound }
}