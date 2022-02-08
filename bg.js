// Copyright (c) 2022 Double-oxygeN
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

const requestSpeechFromText = async (text, speakerId) => {
  const voicevoxApiEndpoint = 'http://127.0.0.1:50021'
  const fetchSpeechAuxiliaryData = async (text, speakerId) => {
    const encodedTextAsUri = encodeURIComponent(text.trim())
    const audioInfo = await fetch(`${voicevoxApiEndpoint}/audio_query?text=${encodedTextAsUri}&speaker=${speakerId}`, {
      method: 'POST'
    })
    return await audioInfo.json()
  }

  const fetchSynthesizedAudioArrayBuffer = async (speakerId, aux) => {
    const synthesisHeaders = new Headers({
      'Accept': 'audio/wav',
      'Content-Type': 'application/json'
    })
    const synthesis = await fetch(`${voicevoxApiEndpoint}/synthesis?speaker=${speakerId}`, {
      method: 'POST',
      headers: synthesisHeaders,
      body: JSON.stringify(aux)
    })
    return await synthesis.arrayBuffer()
  }

  const speechAuxiliaryData = await fetchSpeechAuxiliaryData(text, speakerId)
  const synthesizedAudioArrayBuffer = await fetchSynthesizedAudioArrayBuffer(speakerId, speechAuxiliaryData)

  const ctx = new AudioContext()
  const audioData = await ctx.decodeAudioData(synthesizedAudioArrayBuffer)
  const audioSrc = new AudioBufferSourceNode(ctx, {
    buffer: audioData
  })
  const audioGain = new GainNode(ctx, {
    gain: 1.0
  })
  audioSrc.connect(audioGain)
  audioGain.connect(ctx.destination)
  audioSrc.start()
  audioSrc.addEventListener('ended', () => {
    ctx.close()
  })
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'voicevox:speech',
    title: 'VOICEVOX 読み上げ',
    contexts: ['selection']
  })
})

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  switch (info.menuItemId) {
  case 'voicevox:speech':
    const { speakerId } = await chrome.storage.local.get('speakerId')
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: requestSpeechFromText,
      args: [info.selectionText, speakerId]
    })
    break;
  default:
  }
})
