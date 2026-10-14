import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	serverActions: {
		bodySizeLimit: "5mb",
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
			},
		],
	},
};

export default nextConfig;
