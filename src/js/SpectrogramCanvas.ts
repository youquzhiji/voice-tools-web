import CanvasController from "@/js/CanvasController";
import * as tf from '@tensorflow/tfjs'
import meyda from 'meyda'

function fft(audio: AudioBuffer)
{
    const input = tf.tensor1d(audio.getChannelData(0))
    const n_fft = 2048
}

export default class SpectrogramCanvas extends CanvasController
{
    /**
     * Draw full audio
     *
     * @param audio Full decoded audio
     * @param audioCtx
     */
    drawAudio(audio: AudioBuffer, audioCtx: AudioContext)
    {
        const source = audioCtx.createBufferSource()
        const analyzer = meyda.createMeydaAnalyzer({
            audioContext: audioCtx,
            source,
            bufferSize: 2048,
            featureExtractors: ['amplitudeSpectrum'],
            callback: (features: any) => {
                console.log(features.amplitudeSpectrum)
                analyzer.stop()
            }
        })
        analyzer.start()
    }
}