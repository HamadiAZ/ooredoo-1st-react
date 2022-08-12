import React from "react";
import { TextSpan } from "typescript";

export default function Footer(): JSX.Element {
  return (
    <footer>
      <div id="footer-download-apps">
        <h1>Telecharger notre application</h1>
        <a href="">
          <img
            src="https://www.commande-pizzatime.com/CESARWEB_WEB/play_store-icon.png"
            alt="download app from store"
          />
        </a>
        <a href="">
          <img
            src="https://www.commande-pizzatime.com/CESARWEB_WEB/app_store_icon.png"
            alt="download app from store"
          />
        </a>
      </div>
      <div id="footer--conditions-column">
        <p>Mentions légales</p>
        <p>Politique de confidentialité</p>
        <p>CGV</p>
        <p>CGU</p>
      </div>
      <div id="footer--social-column">
        <p>Suivez-nous :</p>
        <div>
          <img
            src="https://www.commande-pizzatime.com/CESARWEB_WEB/instagram_icon.svg"
            alt="instagram page link"
          />
          <img
            src="https://www.commande-pizzatime.com/CESARWEB_WEB/fcb_icon.svg"
            alt="facebook page link"
          />
        </div>
      </div>
      <div id="footer--last-row">
        <p>Tous droits réservés -Ooredoo shops by Hammadi</p>
        <p>
          Softavera N°1 des solutions d'encaissement, caisse tactile, borne de
          commande, click & collect site web commande en ligne..., plus d’infos
          : www.softavera.fr
        </p>
      </div>
    </footer>
  );
}
