// ==UserScript==
// @name     Cookie Clicker Helper
// @namespace    http://yo1.dog
// @version      1.0.0
// @description  Helps you click cookies.
// @author       Mike "yo1dog" Moore
// @match        http://orteil.dashnet.org/cookieclicker/*
// @grant        none
// @icon         https://raw.githubusercontent.com/yo1dog/cookie-clicker-helper/master/icon.ico
// @run-at       document-idle
// ==/UserScript==

const unsafeWindow = window.wrappedJSObject;


// wait for game to load
async function main() {
  const chGame = await waitForCHGame();
  
  try {
    const dialogElem = createDialogElem();
    document.body.appendChild(dialogElem);
    const chObjectListElem = document.getElementById('cookieHelperObjectList');
    
    const chObjectInfos = getCHObjectInfos(chGame);
    
    const intervalHandle = setInterval(() => {
      try {
        refreshCHObjectInfosCPCPS(chGame, chObjectInfos);
        refreshObjectList(chObjectListElem, chObjectInfos);
      }
      catch(err) {
        console.error(err);
        clearInterval(intervalHandle);
      }
    }, 100);
  }
  catch(err) {
    console.error(err);
  }
}

function createDialogElem() {
  const template = document.createElement('template');
  template.innerHTML = `
    <div>
      <ol id="cookieHelperObjectList" style="display: fixed; bottom: 0; left: 0; z-index: 9999; background-color: #FFF; color: #000; padding: 10px;"></ol>
    </div>
  `.trim();
  
  return template.content.firstChild;
}

function getCHGame() {
  return unsafeWindow.Game;
}
function getCHObjectInfos(chGame) {
  const chObjectInfos = [];
  for (let key in chGame.Objects) {
    chObjectInfos.push({
      chObject: chGame.Objects[key],
      cpcps   : 0
    });
  }
  
  return chObjectInfos;
}

function refreshCHObjectInfosCPCPS(chGame, chObjectInfos) {
  chObjectInfos.forEach(chObjectInfo => {
    chObjectInfo.cpcps = calcCHObjectCPCPS(chGame, chObjectInfo.chObject);
  });
}
function calcCHObjectCPCPS(chGame, chObject) {
  // calculate cookies per cookies per second
  const cps = chObject.amount === 0? 0 : (chObject.storedTotalCps / chObject.amount) * chGame.globalCpsMult;
  return cps === 0? 0 : chObject.getPrice() / cps;
}

function refreshObjectList(chObjectListElem, chObjectInfos) {
  while (chObjectListElem.firstChild) {
    chObjectListElem.removeChild(chObjectListElem.firstChild);
  }
  
  chObjectInfos
  .slice(0)
  .filter(chObjectInfo => chObjectInfo.chObject.amount > 0 && chObjectInfo.cpcps)
  .sort((a, b) => a.cpcps - b.cpcps)
  .forEach(chObjectInfo => {
    const chObjectListItemElem = document.createElement('li');
    chObjectListItemElem.innerText = `${chObjectInfo.chObject.displayName} (${chObjectInfo.cpcps.toFixed(2)})`;
    
    chObjectListElem.appendChild(chObjectListItemElem);
  });
}

async function waitForCHGame() {
  return new Promise(resolve => {
    function iter() {
      const chGame = getCHGame();
      if (chGame && chGame.Objects) {
        return resolve(chGame);
      }
      setTimeout(iter, 100);
    }
    iter();
  });
}

main();