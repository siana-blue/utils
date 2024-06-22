/*
 * Retourne une liste de fichiers matchant un path avec wildcard '*'.
 *
 * @arg path
 * Le chemin à parcourir, éventuellement décrit par des wildcards '*'.
 * @arg base
 * Le chemin de base (sans wildcard) séparant le dossier dans lequel est executé ce script
 * et le dossier de début de recherche (racine du path, premier argument).
 *
 * Typiquement l'argument base n'est pas utilisé depuis l'extérieur, il est utilisé en
 * interne de la fonction pour l'appel récursif.
 *
 * @warning
 * L'élément ".." n'est pas accepté, nulle part dans la chaîne.
 */
function pathToFiles(path, base) {
  let files = [];
  let pathTmp = "";
  const fs = require("node:fs");

  // Division du path en éléments (dossier ou fichier) entre "/"
  // Normalise les séparateurs et supprime les éventuels éléments vides et '.'
  // (vide normalement impossible sauf si / à la fin)
  const ele = path
    .replaceAll("\\", "/")
    .split("/")
    .filter((w) => w !== "" && w !== ".");

  // Pour chaque élément du path
  for (let i = 0; i < ele.length; i++) {
    // S'il y a un wildcard à traiter
    if (ele[i].includes("*")) {
      // On traite l'ensemble des éléments possibles.
      // Pour cela, on ouvre base + pathTmp et on liste tous les fichiers
      let pathUntilNow = "";
      if (base) {
        let bs = base.replaceAll("\\", "/");
        if (bs[bs.length - 1] !== "/") bs += "/";
        pathUntilNow += bs;
      }
      pathUntilNow += pathTmp;
      if (pathUntilNow === "") pathUntilNow = ".";
      const dirs = fs.readdirSync(pathUntilNow);
      for (let dir of dirs) {
        // Pour chaque dir qui matche le wildcard
        if (dir.match("^" + ele[i].replaceAll("*", ".*") + "$")) {
          // Si on est en bout de path
          if (i === ele.length - 1) {
            // On ajoute le dir (fichier) trouvé à la liste de retour
            files.push(pathTmp + dir);
          } else {
            // Sinon, on appelle pathToFiles de manière récursive avec une base égale au
            // pathUntilNow + le dir trouvé (dossier), et un path argument égal
            // aux éléments qui suivent.
            // On en récupère la liste retournée et on a fini pour ce dir.
            let remainingPath = "";
            for (let j = i + 1; j < ele.length; j++) {
              remainingPath += ele[j] + "/";
            }
            const fls = pathToFiles(remainingPath, pathUntilNow + dir);
            for (let f of fls) {
              files.push(pathUntilNow + dir + "/" + f);
            }
          }
        }
      }
    } else {
      // Sinon, on ajoute simplement l'élément du path au pathTmp
      pathTmp += ele[i];

      // Si c'était le dernier élément du path, on ajoute pathTmp au tableau de retour
      if (i === ele.length - 1) files.push(pathTmp);
      // Sinon on passe à l'élément suivant du path, après avoir ajouté un '/'
      else pathTmp += "/";
    }
  }

  return files;
}

module.exports = pathToFiles;
