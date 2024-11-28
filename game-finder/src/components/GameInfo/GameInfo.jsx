import "./GameInfo.scss";

export default function GameInfo({ currentGame }) {
  const { id, title, description, release_date, imageurlSmall, imageurlBig } =
    currentGame;

  return (
    <div className="gameInfo__container">
      <div className="gameInfo__imageContainer">
        <img src={imageurlBig} alt={title} className="gameInfo__image" />
      </div>
      <div className="gameInfo__details">
        <h2>{title}</h2>
        <p>{description}</p>
        <p>Release Date: {new Date(release_date).toLocaleDateString()}</p>
      </div>
    </div>
  );
}
