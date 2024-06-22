/*
 * SCRIPT
 *
 * La fonction de ce script est de remplacer, dans un ou plusieurs fichiers HTML,
 * les informations sensibles par un contenu placeholder (image de chat et lorem).
 *
 * Les images sont remplacées par une photo de chat.
 * Les textes sont remplacés par du lorem.
 * Les liens externes (détectés par la présence de 'http' ou 'pdf') sont supprimés.
 * Cas particulier d'iframe pour google maps, l'adresse 'src' est changée pour afficher Lyon.
 *
 * L'objectif de ce script est d'uploader un template de site web en en supprimant toutes
 * les informations personnelles, mais en gardant la mise en page. Ainsi, le texte lorem
 * est adapté à la longueur du texte original.
 *
 * WARNING: ce script n'est pas forcément très abouti, mais il fait le boulot pour
 * que je puisse mettre sur github la première version de mon site. C'est un script
 * de formation, je me forme à Javascript, nodeJS, cheerio ici... pas plus d'ambition
 * je ne vais pas peaufiner cet utilitaire.
 *
 * DEPENDENCIES
 * Requires npm package cheerio
 * Requires "strUtils.js" et "fileUtils.js"
 *
 * Nécessite un fichier de configuration "cat-config.json".
 * Ce fichier indique :
 * - la destination de la sauvegarde des fichiers html originaux
 * - la ou les cibles, fichiers HTML à traiter
 * - le nom des classes à rechercher dans les fichiers HTML cibles pour déterminer si
 * les éléments associés doivent être traités
 * - les sélecteurs des éléments à traiter
 *
 * La logique de détermination des éléments à traiter est la suivante :
 * - pour être traité, l'élément doit appartenir à la liste de sélecteurs identifiée
 * dans le champ "to-cat"
 * - il ne doit pas avoir comme classe la valeur identifiée dans le champ "no-cat-class",
 * par défaut "NO-CAT" (classe présente dans le fichier HTML cible)
 * - il ne doit pas faire partie des sélecteurs de la liste "no-cat", ou s'il en fait partie,
 * doit avoir la classe identifiée dans "to-cat-class", par défaut "TO-CAT"
 *
 * WARNING: Il est inutile d'ajouter des sélecteurs non présents dans le fichier
 * "cat-config.json" disponible par défaut, car la liste des sélecteurs à considérer
 * est hardcoded. Il est par contre possible d'en supprimer ou de les spécifier
 * avec des relations d'inclusion ou de proximité par exemple.
 *
 * Ca pourrait être mieux fait, mais encore une fois, je ne vais pas y passer des heures,
 * c'était un premier exercice :)
 */

// Lecture du fichier configuration

const catConfigFile = "cat-config.json";
const fs = require("fs");

const data = fs.readFileSync(catConfigFile);
const config = JSON.parse(data);

let saveDest = config["backup-dest"] ?? "./cat-backup/";
let noCatSelector = config["no-cat"];
let noCatClass = config["no-cat-class"] ?? "NO-CAT";
let toCatSelector = config["to-cat"];
let toCatClass = config["to-cat-class"] ?? "TO-CAT";

// Création du répertoire de backup si nécessaire

if (!fs.existsSync(saveDest)) {
  fs.mkdirSync(saveDest);
}
if (saveDest.replaceAll("\\", "/")[saveDest.length - 1] !== "/")
  saveDest += "/";

// Détermination de l'ensemble des fichiers target

const pathToFiles = require("./fileUtils");
const targets = pathToFiles(config.target);

// Sauvegarde de chaque target dans le répertoire de backup

for (let tg of targets) {
  const tgEle = tg.replaceAll("\\", "/").split("/");
  fs.copyFileSync(tg, saveDest + tgEle[tgEle.length - 1]);
}

// Ouverture de chaque target pour modification

const strUtils = require("./strUtils");

const cheerio = require("cheerio");
for (let tg of targets) {
  let htmlContent = fs.readFileSync(tg, "utf-8");
  let $ = cheerio.load(htmlContent);

  // Gestion des images

  processElement($, "img", function () {
    $(this).attr("src", "img/obfuscat.jpg");
    $(this).attr("alt", "");
  });

  // Gestion des textes

  processElement($, "p, figcaption, h1, h2, h3, h4, h5, h6", function () {
    $(this).html(strUtils.fromHTMLToLorem($(this).html()));
  });

  // Gestion des liens : suppression des liens externes uniquement

  processElement($, "a", function () {
    let atr = $(this).attr("href");
    if (atr) {
      if (atr.includes("http") || atr.includes("pdf")) {
        $(this).attr("href", "#");
      }
    }
  });

  // Gestion de l'iframe Google maps

  processElement($, "iframe", function () {
    let atr = $(this).attr("src");
    if (atr) {
      if (atr.includes("https://www.google.com/maps/"))
        $(this).attr(
          "src",
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d44538.5269515663!2d4.793930679250632!3d45.75800318057381!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47f4ea516ae88797%3A0x408ab2ae4bb21f0!2sLyon!5e0!3m2!1sfr!2sfr!4v1718915751285!5m2!1sfr!2sfr"
        );
    }
  });

  // Sauvegarde de la target à la place de l'original

  fs.writeFileSync(tg, $.html());
}

// Cette fonction filtre les éléments selon la logique expliquée en début de fichier,
// puis applique la fonction passée en paramètre pour transformer ces éléments.
//
// Les sélecteurs sont les variables globales... (ça pourrait être mieux fait)
function processElement($, elementName, fct) {
  const $ele = $(elementName).filter(function () {
    return (
      $(this).is(toCatSelector) &&
      !$(this).hasClass(noCatClass) &&
      (!$(this).is(noCatSelector) || $(this).hasClass(toCatClass))
    );
  });
  $ele.each(fct);
}
