export type PortfolioCategory =
	| "Fine line Tattoos"
	| "Realistic Color Tattoos"
	| "Realistic Black & Gray Tattoos";

export type PortfolioItem = {
	id: string;
	title: string;
	imageUrl: string;
	altText: string;
	category: PortfolioCategory;
	description?: string;
	isPublished: boolean;
	sortOrder: number;
};

export const portfolioItems: PortfolioItem[] = [
	{
		id: "flower-and-bird",
		title: "Flower and bird",
		imageUrl: "/IMG_9728.JPG",
		altText: "Color tattoo of a bird and flowers on an arm",
		category: "Realistic Color Tattoos",
		description: "Color studies that follow the natural movement of the body.",
		isPublished: true,
		sortOrder: 1,
	},
	{
		id: "red-floral",
		title: "Red floral",
		imageUrl: "/IMG_6937.jpg",
		altText: "Red and black floral tattoos on a client's arm",
		category: "Realistic Color Tattoos",
		isPublished: true,
		sortOrder: 2,
	},
	{
		id: "sun-charm",
		title: "Sun charm",
		imageUrl: "/IMG_5199.jpg",
		altText: "Small colorful sun and charm tattoos on a client's arm",
		category: "Realistic Color Tattoos",
		isPublished: true,
		sortOrder: 3,
	},
	{
		id: "butterfly",
		title: "Butterfly",
		imageUrl: "/IMG_4909.JPG",
		altText: "Fine line butterfly tattoo on a client's arm",
		category: "Realistic Color Tattoos",
		isPublished: true,
		sortOrder: 4,
	},
	{
		id: "turtle",
		title: "Sea turtle",
		imageUrl: "/IMG_2149.jpg",
		altText: "Detailed black and gray sea turtle tattoo",
		category: "Realistic Black & Gray Tattoos",
		isPublished: true,
		sortOrder: 1,
	},
	{
		id: "elephant",
		title: "Elephant",
		imageUrl: "/IMG_5363.jpg",
		altText: "Small fine line elephant tattoo on a client's ankle",
		category: "Realistic Black & Gray Tattoos",
		isPublished: true,
		sortOrder: 2,
	},
	{
		id: "dog-portrait",
		title: "Dog portrait",
		imageUrl: "/IMG_6159.jpg",
		altText: "Black and gray dog portrait tattoo",
		category: "Realistic Black & Gray Tattoos",
		isPublished: true,
		sortOrder: 3,
	},
	{
		id: "botanical-linework",
		title: "Botanical linework",
		imageUrl: "/DSCF8097.jpg",
		altText: "Fine line botanical tattoo on a client's arm",
		category: "Realistic Black & Gray Tattoos",
		isPublished: true,
		sortOrder: 4,
	},
	{
		id: "unpublished-study",
		title: "Unpublished study",
		imageUrl: "/IMG_5365.jpg",
		altText: "Unpublished tattoo study",
		category: "Realistic Black & Gray Tattoos",
		isPublished: false,
		sortOrder: 5,
	},
];
