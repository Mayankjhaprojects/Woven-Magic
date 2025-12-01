// Helper to resolve product images
import image1 from '../images/Image1.jpeg';
import image2 from '../images/Image2.jpeg';
import image3 from '../images/Image3.jpeg';
import image4 from '../images/Image4.jpeg';
import image5 from '../images/Image5.jpeg';
import image6 from '../images/Image6.jpeg';

const imageMap = {
  'Image1.jpeg': image1,
  'Image2.jpeg': image2,
  'Image3.jpeg': image3,
  'Image4.jpeg': image4,
  'Image5.jpeg': image5,
  'Image6.jpeg': image6,
};

export const resolveImage = (imagePath) => {
  if (!imagePath) return '/placeholder.jpg';
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Extract filename from path
  const filename = imagePath.split('/').pop();
  
  // If we have the image imported, use it
  if (imageMap[filename]) {
    return imageMap[filename];
  }
  
  // Otherwise, try to use the path as is (for public folder)
  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
};

