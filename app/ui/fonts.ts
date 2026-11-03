import { Inter, Lusitana } from 'next/font/google';

// Inter font is used for body text and general content in the application.
// It provides a clean and modern look, making it suitable for various types of content. 
// The font weights 400 (regular) and 700 (bold) are included to allow for flexibility in styling different text elements.
export const inter = Inter({ 
    subsets: ['latin'] 
});

// Lusitana font is used for headings and other prominent text elements in the application. 
// It provides a classic and elegant look, making it suitable for titles and important content. 
// The font weights 400 (regular) and 700 (bold) are included to allow for flexibility in styling different text elements.
export const lusitana = Lusitana({ 
    subsets: ['latin'], 
    weight: ['400', '700'] 
});