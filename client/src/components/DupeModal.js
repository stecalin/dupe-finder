import { useState, useEffect } from "react";
import "./DupeModal.css";

function DupeModal({ dupe, onClose }) {
  const [images, setImages] = useState([dupe.image]);
  const [activeImg, setActiveImg] = useState(dupe.image);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/amazon/product/${dupe.asin}`);
        const data = await res.json();
        if (data.imageUrlList && data.imageUrlList.length > 0) {
          setImages(data.imageUrlList);
          setActiveImg(data.imageUrlList[0]);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchImages();
  }, [dupe.asin]);

  const rating = dupe.productRating ? dupe.productRating.split(" ")[0] : null;
  const stars = rating ? "★".repeat(Math.round(parseFloat(rating))) + "☆".repeat(5 - Math.round(parseFloat(rating))) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div className="modal-content">
          <div className="modal-images">
            <div className="modal-main-img">
              <img src={activeImg} alt={dupe.name} />
            </div>
            {!loading && images.length > 1 && (
              <div className="modal-thumbnails">
                {images.slice(0, 6).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`view ${i}`}
                    className={activeImg === img ? "thumb active" : "thumb"}
                    onClick={() => setActiveImg(img)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="modal-info">
            {dupe.brand && <p className="modal-brand">{dupe.brand}</p>}
            <h2 className="modal-name">{dupe.name}</h2>
            {stars && (
              <p className="modal-rating">
                <span className="stars">{stars}</span>
                {rating} · {dupe.countReview?.toLocaleString()} reviews
              </p>
            )}
            <p className="modal-price">${dupe.price}</p>
            <a href={dupe.link} target="_blank" rel="noreferrer">
              <button className="modal-btn">View on Amazon ↗</button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DupeModal;