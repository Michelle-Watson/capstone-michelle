import "./GameInfo.scss";

export default function GameInfo({ currentGame }) {
  const placeholderBIGImageUrl =
    "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/469600/header.jpg?t=1732210582"; // Placeholder image URL

  const { id, title, description, release_date } = currentGame;

  return (
    <div className="gameInfo__container">
      <div className="gameInfo__imageContainer">
        <img
          src={placeholderBIGImageUrl}
          alt={title}
          className="gameInfo__image"
        />
      </div>
      <div className="gameInfo__details">
        <h2>{title}</h2>
        <p>{description}</p>
        <p>Release Date: {new Date(release_date).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
