import { createI18n } from 'vue-i18n'

const messages = {
  // English
  en: {
    settings: {
      title: 'Settings'
    }
  },

  // 中文
  cn: {
    settings: {
      title: '設置'
    }
  }
}

// 2. Create i18n instance with options
export const i18n = createI18n({
  locale: 'cn',
  fallbackLocale: 'en',
  messages,
})
