// Copyright (c) 2022 Double-oxygeN
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

fetch("http://127.0.0.1:50021/speakers")
  .then(response => response.json())
  .then(data => {
    for (const speaker of data) {
      const speakerGroup = document.createElement("optgroup")
      speakerGroup.label = speaker.name

      for (const style of speaker.styles) {
        const speakerStyleItem = document.createElement("option")
        speakerStyleItem.text = `${speaker.name}（${style.name}）`
        speakerStyleItem.value = style.id
        speakerGroup.appendChild(speakerStyleItem)
      }

      speakerMenu.appendChild(speakerGroup)
    }
  })

speakerMenu.addEventListener("change", ev => {
  chrome.storage.local.set({
    'speakerId': ev.target.value
  })
})
