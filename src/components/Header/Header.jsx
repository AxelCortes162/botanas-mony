import './Header.css';

const Header = () => {
  return (
    <header className="header-container">
      <img src="/logolargo.png" alt="Logo" className="header-logo" />
      {/* <h1 className="header-title">Botanas Mony</h1> */}
      <p className="header-subtitle">¡Antójate y pide tus favoritas!</p>
    </header>
  );
};

export default Header;