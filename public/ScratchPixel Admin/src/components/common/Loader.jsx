function Loader({
  text = "Loading...",
  fullScreen = true,
  className = "",
}) {
  return (
    <div
      className={`${fullScreen ? "screen-loader" : "inline-loader"} ${className}`}
    >
      <div className="loader"></div>
      {text && <p>{text}</p>}
    </div>
  );
}

export default Loader;