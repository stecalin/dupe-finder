import "./DupeCard.css";

function DupeCard({ onClick, name, brand, price, image, link, productRating, countReview }) {
  const rating = productRating ? productRating.split(" ")[0] : null;
  const stars = rating ? "★".repeat(Math.round(parseFloat(rating))) : null;

  return (
    <div className="card" onClick={onClick}>
      <div className="card-img-wrapper">
        <img src={image} alt={name} className="card-img" />
        <span className="card-badge">DUPE</span>
      </div>
      <div className="card-body">
        {brand && <p className="card-brand">{brand}</p>}
        <p className="card-name">{name}</p>
        {stars && (
          <p className="card-rating">
            <span className="stars">{stars}</span>
            {rating} {countReview && `· ${countReview.toLocaleString()} reviews`}
          </p>
        )}
        <div className="card-footer">
          <span className="card-price">${price}</span>
          <button className="card-btn" onClick={e => { e.stopPropagation(); window.open(link, '_blank'); }}>
            View Deal
          </button>
        </div>
      </div>
    </div>
  );
}

export default DupeCard;