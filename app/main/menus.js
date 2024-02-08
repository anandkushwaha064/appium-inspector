import {Menu, app, dialog, shell} from 'electron';

import {languageList} from '../configs/app.config';
import i18n from '../configs/i18next.config';
import {checkNewUpdates} from './auto-updater';
import {APPIUM_SESSION_EXTENSION} from './helpers';
import {launchNewSessionWindow} from './windows';

const INSPECTOR_DOCS_URL = 'https://appium.github.io/appium-inspector';
const APPIUM_DOCS_URL = 'https://appium.io';
const APPIUM_FORUM_URL = 'https://discuss.appium.io';
const GITHUB_ISSUES_URL = 'https://github.com/appium/appium-inspector/issues';
const CROWDIN_URL = 'https://crowdin.com/project/appium-desktop';

let mainWindow, isMac, isDev;

const t = (string, params = null) => i18n.t(string, params);

const separator = {type: 'separator'};

const showAppInfoPopup = () => {
  dialog.showMessageBox({
    title: t('appiumInspector'),
    message: t('showAppInfo', {
      appVersion: app.getVersion(),
      electronVersion: process.versions.electron,
      nodejsVersion: process.versions.node,
    }),
  });
};

const optionAbout = () => ({
  label: t('About Appium Inspector'),
  click: () => showAppInfoPopup(),
});

const optionCheckForUpdates = () => ({
  label: t('Check for Updates…'),
  click: () => checkNewUpdates(true),
});

const optionHide = () => ({
  label: t('Hide Appium Inspector'),
  role: 'hide',
});

const optionHideOthers = () => ({
  label: t('Hide Others'),
  role: 'hideOthers',
});

const optionShowAll = () => ({
  label: t('Show All'),
  role: 'unhide',
});

const optionQuit = () => ({
  label: t('Quit Appium Inspector'),
  role: 'quit',
});

const optionNewWindow = () => ({
  label: t('New Window'),
  accelerator: 'CmdOrCtrl+N',
  click: launchNewSessionWindow,
});

const optionCloseWindow = () => ({
  label: t('Close Window'),
  role: 'close',
});

async function openFileCallback() {
  const {canceled, filePaths} = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{name: 'Appium Session Files', extensions: [APPIUM_SESSION_EXTENSION]}],
  });
  if (!canceled) {
    const filePath = filePaths[0];
    mainWindow.webContents.send('open-file', filePath);
  }
}

const optionOpen = () => ({
  label: t('Open Session File…'),
  accelerator: 'CmdOrCtrl+O',
  click: () => openFileCallback(),
});

async function saveAsCallback() {
  const {canceled, filePath} = await dialog.showSaveDialog({
    title: i18n.t('saveAs'),
    filters: [{name: 'Appium', extensions: [APPIUM_SESSION_EXTENSION]}],
  });
  if (!canceled) {
    mainWindow.webContents.send('save-file', filePath);
  }
}

const optionSaveAs = () => ({
  label: t('saveAs'),
  accelerator: 'CmdOrCtrl+S',
  click: () => saveAsCallback(),
});

const optionUndo = () => ({
  label: t('Undo'),
  role: 'undo',
});

const optionRedo = () => ({
  label: t('Redo'),
  role: 'redo',
});

const optionCut = () => ({
  label: t('Cut'),
  role: 'cut',
});

const optionCopy = () => ({
  label: t('Copy'),
  role: 'copy',
});

const optionPaste = () => ({
  label: t('Paste'),
  role: 'paste',
});

const optionDelete = () => ({
  label: t('Delete'),
  role: 'delete',
});

const optionSelectAll = () => ({
  label: t('Select All'),
  role: 'selectAll',
});

const optionToggleFullscreen = () => ({
  label: t('Toggle Full Screen'),
  role: 'togglefullscreen',
});

const optionResetZoom = () => ({
  label: t('Reset Zoom Level'),
  role: 'resetZoom',
});

const optionZoomIn = () => ({
  label: t('Zoom In'),
  role: 'zoomIn',
});

const optionZoomOut = () => ({
  label: t('Zoom Out'),
  role: 'zoomOut',
});

const getLanguagesMenu = () =>
  languageList.map((language) => ({
    label: `${language.name} (${language.original})`,
    type: 'radio',
    checked: i18n.language === language.code,
    click: () => i18n.changeLanguage(language.code),
  }));

const optionLanguages = () => ({
  label: t('Languages'),
  submenu: getLanguagesMenu(),
});

const optionReload = () => ({
  label: t('Reload'),
  role: 'reload',
});

const optionToggleDevTools = () => ({
  label: t('Toggle Developer Tools'),
  role: 'toggleDevTools',
});

const optionMinimize = () => ({
  label: t('Minimize'),
  role: 'minimize',
});

const optionZoom = () => ({
  label: t('Zoom'),
  role: 'zoom',
});

const optionBringAllToFront = () => ({
  label: t('Bring All to Front'),
  role: 'front',
});

const optionInspectorDocumentation = () => ({
  label: t('Inspector Documentation'),
  click: () => shell.openExternal(INSPECTOR_DOCS_URL),
});

const optionAppiumDocumentation = () => ({
  label: t('Appium Documentation'),
  click: () => shell.openExternal(APPIUM_DOCS_URL),
});

const optionAppiumForum = () => ({
  label: t('Appium Discussion Forum'),
  click: () => shell.openExternal(APPIUM_FORUM_URL),
});

const optionReportIssues = () => ({
  label: t('Report Issues'),
  click: () => shell.openExternal(GITHUB_ISSUES_URL),
});

const optionImproveTranslations = () => ({
  label: t('Improve Translations'),
  click: () => shell.openExternal(CROWDIN_URL),
});

const dropdownApp = () => ({
  label: t('appiumInspector'),
  submenu: [
    optionAbout(),
    optionCheckForUpdates(),
    separator,
    optionHide(),
    optionHideOthers(),
    optionShowAll(),
    separator,
    optionQuit(),
  ],
});

const dropdownFile = () => {
  const submenu = [optionNewWindow(), optionCloseWindow(), separator, optionOpen(), optionSaveAs()];

  if (!isMac) {
    submenu.push(...[separator, optionAbout()]);
    // If it's Windows, add a 'Check for Updates' menu option
    if (process.platform === 'win32') {
      submenu.push(optionCheckForUpdates());
    }
  }

  return {
    label: t('File'),
    submenu,
  };
};

const dropdownEdit = () => ({
  label: t('Edit'),
  submenu: [
    optionUndo(),
    optionRedo(),
    separator,
    optionCut(),
    optionCopy(),
    optionPaste(),
    optionDelete(),
    optionSelectAll(),
  ],
});

const dropdownView = () => {
  const submenu = [
    optionToggleFullscreen(),
    optionResetZoom(),
    optionZoomIn(),
    optionZoomOut(),
    separator,
    optionLanguages(),
  ];

  if (isDev) {
    submenu.push(...[separator, optionReload(), optionToggleDevTools()]);
  }

  return {
    label: t('View'),
    submenu,
  };
};

const dropdownWindow = () => ({
  label: t('Window'),
  submenu: [optionMinimize(), optionZoom(), separator, optionBringAllToFront()],
});

const dropdownHelp = () => ({
  label: t('Help'),
  submenu: [
    optionInspectorDocumentation(),
    optionAppiumDocumentation(),
    optionAppiumForum(),
    separator,
    optionReportIssues(),
    optionImproveTranslations(),
  ],
});

const buildMenuTemplate = () => [
  ...(isMac ? [dropdownApp()] : []),
  dropdownFile(),
  dropdownEdit(),
  dropdownView(),
  ...(isMac ? [dropdownWindow()] : []),
  dropdownHelp(),
];

export function rebuildMenus(localMainWindow, localIsDev) {
  mainWindow = localMainWindow;
  isMac = process.platform === 'darwin';
  isDev = localIsDev;

  const menu = Menu.buildFromTemplate(buildMenuTemplate());

  if (isMac) {
    Menu.setApplicationMenu(menu);
  } else {
    mainWindow.setMenu(menu);
  }
}
