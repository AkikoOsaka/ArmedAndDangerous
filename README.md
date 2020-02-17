# Armed and Dangerous
Repository for the module "Prototyping interactive media-applications and games" at Furtwangen University

[Abgabe](https://akikoosaka.github.io/ArmedAndDangerous/game/)


## Checkliste für Leistungsnachweis
© Prof. Dipl.-Ing. Jirka R. Dell'Oro-Friedl, HFU

| Nr | Bezeichnung           | Inhalt                                                                                                                                                                                                                                                                         |
|---:|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|    | Titel                 | Armed and Dangerous
|    | Name                  | Monika Galkewitsch
|    | Matrikelnummer        | 258316
|  1 | Nutzerinteraktion     | Der Nutzer kann über Tastatur das Spiel steuern. Er bewegt die Spielfigur mit den WASD Tasten, kann mit den Pfeiltasten schießen und mit der Leertaste springen.                                                                                                                                                |
|  2 | Objektinteraktion     | Es gibt verschiedene Gegnertypen, mit denen der Spieler kollidieren kann. Der Spieler nimmt in diesem Fall Schaden. Der Spieler kann indirekt mit den Gegnern andersweitig interagieren, in dem er sie beschiest. Die Kugeln kollidieren mit den Gegnern und diese nehmen dadurch Schaden. Es gibt aussderm natürlich Plattformen, mit denen die Gegner und der Spieler interagieren (sie dienen als Level-Geometrie), so wie ein Ausgang, der das Spielziel bildet.                                                                                                                                                                                |
|  3 | Objektanzahl variabel | Das ganze Level wird zur Laufzeit generiert, samt Gegner und Ausgang. Gegner können, wenn sie genug Schaden nehmen, sterben. Diese werden dann aus der Szene entfernt.                                                                                                                                                      |
|  4 | Szenenhierarchie      | Die Szene ist in drei große Knoten unterteilt. "Game" ist der Kernknoten der alle fürs Spielgeschehen wichtigen Knoten hält. Level hält die Levelgeometrie und Entities hält alle Charactere. Diese trennung erlaubt es, gezielt Kollision zwischen Knoten zu verwalten.                                                                                                                                                         |
|  5 | Sound                 | Es sollten Soundeffekte eingesetzt werden, namentlich Hintergrund Musik und Soundeffekte fürs Schiesen.                                                           |
|  6 | GUI                   | Im Hauptmenü kann der Spieler den Schwierigkeitsgrad festlegen.                                                                                  |
|  7 | Externe Daten         | Die gesamte Spiellogik, und damit auch alle notwendigen Parameter befinden sich in externen java/typescript dateien.                                                                                    |
|  8 | Verhaltensklassen     | Das Verhalten von Objekten ist in den Methoden von Klassen definiert, die in externen Dateien abgelegt sind. Welche Klassen sind dies und welches Verhalten wird dort beschrieben?                                                                                             |
|  9 | Subklassen            | Die Mehrzahl der im Spiel erscheinenden Entitäten erben von ƒ.Node, darüber hinaus erben alle Charaktere (Gegner, Spielfigur) von der Klasse Character|

| 10 | Maße & Positionen     | Das Level besteht aus 1x1 FudgeUnit Blöcken. Alle Charactere sind wesentlich kleiner als das (etwa 1/3 Fudge Unit). Das Level soll verhältnismässig viel Platz bieten, damit der Spieler sich frei bewegen kann. Das Spiel basiert stark auf Mobilität, weshalb der große Spielraum gewünscht ist.                                                               |
| 11 | Event-System          | Animationen und das Wechseln der Spielzustände passiert über Events.                                                                                                                                                                                  |

