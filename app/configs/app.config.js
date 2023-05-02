const config = {
  platform: process.platform,
  languages: ['de', 'en', 'hi', 'it', 'ja', 'ko', 'kn', 'ml-IN', 'pa-IN', 'pt-BR', 'ru', 'te', 'zh-CN'],
  namespace: 'translation',
};

function getI18NextOptions (settings, config, backend) {
  return {
    backend,
    // debug: true,
    // saveMissing: true,
    interpolation: {
      escapeValue: false
    },
    lng: settings && settings.getSync('PREFERRED_LANGUAGE', 'en') || 'en',
    fallbackLng: config.fallbackLng,
    whitelist: config.languages,
    react: {
      wait: false
    }
  };
}


export default config;
export { getI18NextOptions };
