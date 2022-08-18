import { useEffect, useState } from "react";
import { imageGalleryArrayType } from "../../types/types";
//icons
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";

//main
let lastTimeMainImageChanged: number = 0;

export default function Gallery({
  storePath,
  store_id,
}: {
  storePath: string;
  store_id: number;
}): JSX.Element {
  // vars & states
  let GalleryImagesArray: imageGalleryArrayType;

  const [numberOfImages, setNumberOfImages] = useState(0);
  const [galleryCounter, setGalleryCounter] = useState(1);

  let galleryCurrentImage = `${storePath}/gallery/${galleryCounter + 1}.png`;

  async function getGalleryImagesArray() {
    try {
      let res = await fetch("http://localhost:5000/api/getGalleryListOfStore/" + store_id);
      GalleryImagesArray = await res.json();
      setNumberOfImages(GalleryImagesArray.length);
    } catch (error) {
      console.error(error);
    }
  }

  function updateImage(direction: string = "right"): void {
    lastTimeMainImageChanged = Date.now();

    if (direction === "right") {
      galleryCounter < numberOfImages - 1
        ? setGalleryCounter(galleryCounter + 1)
        : setGalleryCounter(0);
    } else {
      galleryCounter > 0
        ? setGalleryCounter(galleryCounter - 1)
        : setGalleryCounter(numberOfImages - 1);
    }
  }

  useEffect((): void => {
    getGalleryImagesArray();
  }, []);

  useEffect((): (() => void) => {
    // update the wallpaper if 3 seconds passed from last change
    const interval = setInterval(() => {
      if (Date.now() - lastTimeMainImageChanged > 3000) {
        updateImage();
      }
    }, 500);
    return (): void => clearInterval(interval);
  }, [galleryCounter]);

  return (
    <div className="image-gallery">
      <img src={galleryCurrentImage} />
      <div id="store-hidden-div--gallery-buttons-container">
        <div className="arrows-leftandright-divs" onClick={(): void => updateImage("left")}>
          <AiOutlineArrowLeft className="gallery-arrows" />
        </div>
        <div className="arrows-leftandright-divs" onClick={(): void => updateImage("right")}>
          <AiOutlineArrowRight className="gallery-arrows" />
        </div>
      </div>
    </div>
  );
}
