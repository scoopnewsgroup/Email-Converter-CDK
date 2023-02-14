/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		appDir: true,
	},
	exportPathMap: function () {
		return {
			'/': { page: '/' },
		};
	},
};

module.exports = nextConfig;
