/*
 * Retourne les 'n' premiers mots d'une chaîne de caractères.
 * Les mots sont séparés par des espaces.
 *
 * La fonction boucle sur la chaîne 'str' si celle-ci est trop courte, recommençant
 * au début.
 *
 * @arg str
 * La chaîne de caratère dont extraire les 'n' mots.
 * @arg n
 * Le nombre de mots à extraire
 * @arg start
 * Offset (en nombre de mots) d'où commencer l'extraction.
 *
 * @return
 * La chaîne extraite, d'une longeur de 'n' mots.
 */
function nWordsFromString(str, n, start = 0) {
  const words = str.split(" ");

  let rtn = "";
  for (let i = 0, j = start; i < n; i++, j++) {
    if (j >= words.length) j = 0;
    rtn += (i === 0 ? "" : " ") + words[j];
  }
  // pour ne pas finir par une virgule ou un espace. Le point ça passe :)
  // Le point virtugle aussi d'ailleurs, et les deux points aussi. Bref...
  // C'est déjà pas trop mal merci
  if (rtn.charAt(rtn.length - 1) === "," || rtn.charAt(rtn.length - 1) === " ")
    return rtn.substring(0, rtn.length - 1);
  return rtn;
}

/*
 * Cette fonction parle d'elle-même, je n'ai pas envie de la documenter.
 * #rebelle (c'est MON Github)
 *
 * Et ça marche qu'avec des espaces ! Flemme ! Bon c'est une fonction comme ça, parce que
 * j'en avais besoin.
 *
 * Ca va sinon ? Bientôt les vacances ? Tu pars ?
 * ** café qui coule, porte qui s'ouvre au fond du couloir, ambiance du lundi matin **
 * Non, je reste ici, j'ai des travaux à faire dans la baraque.
 * Ah, ok. Bah moi je pars à Biscarosse.
 * Encore Biscarosse ? T'aimes bien le coin.
 * Bah oui c'est pas trop loin et j'aime bien le vélo.
 * C'est vrai que c'est joli les landes j'y suis allée le week-end dernier.
 * Cool.
 */
function countWordsInString(str) {
  return str.split(" ").length;
}

// LOREM <-- Toute une série de fonction sur Lorem

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, " +
  "sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. " +
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris " +
  "nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in " +
  "reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla " +
  "pariatur. Excepteur sint occaecat cupidatat non proident, " +
  "sunt in culpa qui officia deserunt mollit anim id est laborum.";

/*
 * Cette fonction prend une chaîne HTML en entrée, et la convertit de sorte à ne plus laisser
 * de texte visible. Tout est transformé en Lorem, sauf les balises et leur contenu.
 */
function fromHTMLToLorem(str) {
  const re = /<[\w/?]*>/g; // je pense que ce regex est à revoir sur le contenu des balises

  const txts = str.split(re);
  const bals = [...str.matchAll(re)];

  let rtn = "";
  for (let i = 0, j = 0; i < txts.length; i++) {
    const c = countWordsInString(txts[i].trim());
    txts[i] = nWordsFromString(lorem, c, j);
    j += c;
    rtn += (i === 0 ? "" : " ") + txts[i];
    if (i < bals.length) rtn += bals[i];
  }

  return rtn;
}

module.exports = { nWordsFromString, countWordsInString, fromHTMLToLorem };
