const constants = {
	
	SERVER_URL:import.meta.env.DEV ? 'http://localhost:5005' : '',
	languages: [
		{ lang: 'ru', name: 'Русский' },
		{ lang: 'en', name: 'English' },
		{ lang: 'zh', name: '中国人' }
	],

}

export default constants
