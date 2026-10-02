# Grand Ivory Kyber Meta Validation Report

Generated: 2026-10-02T02:58:31.942Z

This report validates generated optimizer targets against the raw Kyber mod distribution used to create them.

> This is an internal-consistency validation, not yet a true holdout test. A later version should train on one player cohort and validate against unseen players.

## Overview

- Raw characters: **447**
- Generated characters: **333**
- Characters validated: **333**
- PASS: **293**
- WARN: **38**
- FAIL: **2**

Compiler thresholds:

- Character samples: 100
- Primary samples: 50
- Primary winner threshold: 80.0%
- Primary winner margin: 40.0%
- Archetype share threshold: 10.0%
- Archetype count threshold: 50
- Max archetypes: 3

## Character Summary

| Status | Character | Samples | Top Loadout | Top Share | Effective Loadouts | Secondary Correlation | Archetypes |
| --- | --- | ---: | --- | ---: | ---: | ---: | ---: |
| FAIL | Admiral Piett | 1764 | health + speed | 61.9% | 4.28 | 0.0482 | 2 |
| FAIL | Sana Starros | 1578 | health + speed | 36.1% | 9.63 | 0.1905 | 2 |
| WARN | Mace Windu | 1898 | health + health + health | 62.5% | 5.25 | 0.5476 | 1 |
| WARN | Bo-Katan Kryze | 1850 | health + critDamage | 41.0% | 10.92 | 0.4762 | 2 |
| WARN | General Syndulla | 1846 | health + speed | 67.6% | 3.61 | 0.491 | 2 |
| WARN | Captain Enoch | 1841 | health + speed | 65.7% | 4.13 | 0.3114 | 2 |
| WARN | Captain Tarpals | 1818 | health + offense | 24.8% | 10.54 | 0.4762 | 3 |
| WARN | Seventh Sister | 1815 | health + speed | 57.7% | 5.21 | 0.5422 | 2 |
| WARN | Finn | 1811 | health + health + health | 20.7% | 18.58 | 0.4671 | 3 |
| WARN | Luthen Rael | 1806 | health + speed | 69.5% | 3.64 | 0.5389 | 2 |
| WARN | Fifth Brother | 1799 | health + speed | 61.3% | 5.16 | 0.3615 | 1 |
| WARN | 0-0-0 | 1790 | speed + potency | 71.1% | 3.54 | 0.527 | 2 |
| WARN | Kyle Katarn | 1786 | health + speed | 30.0% | 10.99 | 0.2619 | 3 |
| WARN | Zam Wesell | 1760 | speed + potency | 40.8% | 6.14 | 0.5476 | 2 |
| WARN | Moff Gideon | 1740 | health + speed | 49.5% | 4.53 | 0.3353 | 2 |
| WARN | Kylo Ren | 1729 | offense + tenacity | 27.4% | 13.68 | 0.5238 | 3 |
| WARN | Plo Koon | 1727 | health + health + health | 40.2% | 8.91 | 0.3095 | 2 |
| WARN | Range Trooper | 1693 | health + speed | 23.1% | 11.41 | 0.5238 | 2 |
| WARN | Hunter | 1686 | critChance + critDamage | 48.2% | 7.68 | 0.5476 | 2 |
| WARN | Pao | 1685 | offense + tenacity | 26.4% | 11.67 | 0.3095 | 3 |
| WARN | 4-LOM | 1671 | speed + tenacity | 50.7% | 6.67 | 0.5476 | 3 |
| WARN | Canderous Ordo | 1664 | health + offense | 29.6% | 9.27 | 0.4048 | 3 |
| WARN | Tusken Raider | 1663 | offense + tenacity | 28.0% | 10.95 | 0.3571 | 2 |
| WARN | Batcher | 1655 | speed + critChance | 44.4% | 8.66 | 0.5476 | 2 |
| WARN | STAP | 1629 | health + speed | 38.4% | 7.92 | 0.381 | 2 |
| WARN | Carth Onasi | 1622 | critDamage + potency | 30.1% | 13.98 | 0.4762 | 2 |
| WARN | Veteran Smuggler Chewbacca | 1621 | critChance + critDamage | 42.0% | 11.59 | 0.4338 | 1 |
| WARN | Kit Fisto | 1613 | health + critDamage | 38.9% | 8.84 | 0.5238 | 3 |
| WARN | Sith Assassin | 1611 | health + speed | 34.0% | 9.51 | 0.2994 | 2 |
| WARN | TIE Fighter Pilot | 1610 | speed + critChance | 34.3% | 13.32 | 0.4392 | 2 |
| WARN | Lobot | 1601 | health + speed | 57.1% | 6.68 | 0.3735 | 2 |
| WARN | Clone Wars Chewbacca | 1564 | health + health + health | 32.4% | 7.08 | 0.5238 | 3 |
| WARN | Jawa | 1479 | health + health + health | 31.7% | 11.27 | 0.4048 | 2 |
| WARN | Young Lando Calrissian | 1430 | offense + critChance | 33.9% | 11.96 | 0.4699 | 3 |
| WARN | Eeth Koth | 1425 | health + health + health | 59.6% | 6.49 | 0.4762 | 1 |
| WARN | Resistance Pilot | 1400 | speed + potency | 30.6% | 15.96 | 0.5238 | 2 |
| WARN | Jedi Knight Guardian | 1313 | health + health + health | 45.9% | 7.44 | 0.5476 | 2 |
| WARN | Hoth Rebel Soldier | 1263 | health + health + health | 63.0% | 6.07 | 0.5238 | 1 |
| WARN | Nightsister Initiate | 1253 | health + offense | 33.9% | 11.51 | 0.5238 | 2 |
| WARN | Ewok Scout | 1215 | critChance + critDamage | 36.1% | 11.85 | 0.503 | 2 |
| PASS | Sith Eternal Emperor | 1929 | health + health + health | 74.6% | 2.19 | 0.9515 | 2 |
| PASS | Jabba the Hutt | 1928 | health + speed | 83.9% | 2.02 | 0.9701 | 1 |
| PASS | Darth Bane | 1924 | health + health + health | 84.8% | 2 | 0.8961 | 1 |
| PASS | Leia Organa | 1922 | health + speed | 83.9% | 2.03 | 0.994 | 1 |
| PASS | Queen Amidala | 1921 | health + speed | 80.0% | 2.54 | 0.9157 | 1 |
| PASS | Paz Vizsla | 1918 | health + health + health | 59.8% | 5.49 | 0.8571 | 2 |
| PASS | Krrsantan | 1916 | health + health + health | 25.6% | 8.2 | 0.8333 | 3 |
| PASS | Darth Malgus | 1910 | health + health + health | 78.7% | 2.3 | 0.9515 | 2 |
| PASS | Barriss Offee | 1907 | health + health + health | 87.5% | 1.92 | 0.8916 | 1 |
| PASS | Master Qui-Gon | 1906 | health + speed | 50.5% | 6 | 0.5577 | 3 |
| PASS | Ezra Bridger (Exile) | 1905 | health + speed | 69.0% | 3.02 | 0.7563 | 2 |
| PASS | Boushh (Leia Organa) | 1904 | speed + potency | 59.2% | 5.5 | 0.8333 | 1 |
| PASS | Rey (Dark Side Vision) | 1904 | health + speed | 41.5% | 4.94 | 0.9341 | 3 |
| PASS | Third Sister | 1904 | health + offense | 68.3% | 3.27 | 0.9701 | 3 |
| PASS | CX-2 | 1903 | health + speed | 74.7% | 3.14 | 0.8371 | 1 |
| PASS | Starkiller | 1902 | health + offense | 62.1% | 3.76 | 0.9286 | 2 |
| PASS | Supreme Leader Kylo Ren | 1902 | health + speed | 77.5% | 2.46 | 0.9461 | 2 |
| PASS | Jedi Knight Cal Kestis | 1900 | health + offense | 35.8% | 5.4 | 0.9701 | 3 |
| PASS | R2-D2 | 1900 | health + offense | 31.5% | 7.79 | 0.8333 | 3 |
| PASS | Rey | 1896 | health + offense | 69.5% | 2.56 | 0.9271 | 3 |
| PASS | Padmé Amidala | 1894 | health + health + health | 69.2% | 3.03 | 0.9461 | 2 |
| PASS | CC-1119 "Appo" | 1893 | health + offense | 40.6% | 5.7 | 0.8095 | 2 |
| PASS | RC-1262 "Scorch" | 1892 | health + health + defense | 53.0% | 4.88 | 0.9762 | 3 |
| PASS | General Kenobi | 1891 | health + health + health | 44.5% | 6.81 | 0.8503 | 3 |
| PASS | Darth Malak | 1889 | health + health + health | 25.7% | 10.45 | 0.9157 | 2 |
| PASS | Morgan Elsbeth | 1889 | health + health + defense | 42.8% | 7.5 | 0.7619 | 3 |
| PASS | Cal Kestis | 1888 | health + health + health | 54.0% | 5.39 | 0.9762 | 2 |
| PASS | Captain Rex | 1888 | health + speed | 48.8% | 5.46 | 0.8862 | 2 |
| PASS | Cere Junda | 1888 | health + health + health | 56.2% | 4.95 | 0.9222 | 3 |
| PASS | Jolee Bindo | 1888 | health + health + health | 59.4% | 4.25 | 0.9286 | 2 |
| PASS | Kylo Ren (Unmasked) | 1888 | health + health + health | 31.6% | 6.42 | 0.8571 | 3 |
| PASS | Lord Vader | 1882 | health + speed | 79.2% | 2.51 | 0.9639 | 1 |
| PASS | IG-12 & Grogu | 1879 | health + speed | 66.8% | 3.65 | 0.9524 | 2 |
| PASS | Captain Drogan | 1878 | offense + critChance | 64.1% | 3.6 | 0.7381 | 2 |
| PASS | Ahsoka Tano | 1876 | defense + speed | 47.0% | 3.77 | 0.9515 | 2 |
| PASS | Death Trooper (Peridea) | 1876 | critChance + critDamage | 62.9% | 4.53 | 0.6905 | 2 |
| PASS | Ben Solo | 1874 | health + offense | 60.7% | 4.29 | 0.9102 | 2 |
| PASS | Bo-Katan (Mand'alor) | 1873 | health + offense | 68.5% | 3.5 | 0.7229 | 2 |
| PASS | Great Mothers | 1873 | health + speed | 84.1% | 2.19 | 0.747 | 1 |
| PASS | Padawan Obi-Wan | 1872 | health + offense | 50.3% | 5.21 | 0.7381 | 2 |
| PASS | Baylan Skoll | 1871 | health + speed | 53.3% | 4.64 | 0.9157 | 3 |
| PASS | Disguised Clone Trooper | 1871 | health + speed | 47.0% | 6.31 | 0.7381 | 2 |
| PASS | Vane | 1871 | health + health + defense | 28.3% | 5.94 | 0.7306 | 3 |
| PASS | Merrin | 1870 | tenacity + tenacity + tenacity | 29.9% | 10.06 | 0.9461 | 2 |
| PASS | Wampa | 1870 | health + health + tenacity | 32.5% | 10.04 | 0.8333 | 3 |
| PASS | General Grievous | 1869 | health + health + health | 79.5% | 2.32 | 0.9515 | 2 |
| PASS | Jedi Master Kenobi | 1869 | health + speed | 83.4% | 2.1 | 0.8982 | 1 |
| PASS | Jedi Master Luke Skywalker | 1869 | health + speed | 60.3% | 3.79 | 0.9701 | 3 |
| PASS | Kelleran Beq | 1869 | health + health + health | 55.0% | 3.94 | 0.9157 | 2 |
| PASS | Mara Jade, The Emperor's Hand | 1868 | speed + potency | 56.2% | 4.31 | 0.6429 | 3 |
| PASS | Commander Luke Skywalker | 1867 | offense + tenacity | 26.7% | 13.83 | 0.7619 | 2 |
| PASS | Maul | 1867 | health + offense | 66.5% | 3.35 | 0.9701 | 2 |
| PASS | Marrok | 1865 | offense + critChance | 35.1% | 9.75 | 0.7857 | 2 |
| PASS | Temple Guard | 1863 | health + health + health | 47.1% | 6.28 | 0.9701 | 2 |
| PASS | Chewbacca | 1861 | tenacity + tenacity + tenacity | 33.4% | 10.45 | 0.6429 | 2 |
| PASS | Huyang | 1860 | offense + critChance | 60.4% | 5.02 | 0.9461 | 2 |
| PASS | Ahsoka Tano (Snips) | 1859 | health + offense | 37.9% | 6.84 | 0.9461 | 2 |
| PASS | C-3PO | 1857 | speed + potency | 49.6% | 7.47 | 0.9286 | 2 |
| PASS | Night Trooper | 1857 | offense + potency | 32.9% | 7.99 | 0.8571 | 3 |
| PASS | General Hux | 1856 | speed + tenacity | 51.8% | 4.41 | 0.9524 | 2 |
| PASS | Ahsoka Tano (Fulcrum) | 1854 | health + offense | 54.4% | 5.01 | 0.8555 | 2 |
| PASS | CT-5555 "Fives" | 1854 | health + health + health | 26.0% | 9.09 | 1 | 3 |
| PASS | Grand Master Yoda | 1854 | health + speed | 27.6% | 8.39 | 0.8571 | 3 |
| PASS | Hondo Ohnaka | 1854 | health + speed | 64.5% | 4.44 | 0.7306 | 2 |
| PASS | Darth Vader | 1853 | offense + potency | 18.5% | 12.12 | 0.7904 | 3 |
| PASS | Admiral Raddus | 1851 | health + speed | 65.1% | 4.23 | 0.6347 | 2 |
| PASS | Jedi Knight Anakin | 1851 | critChance + critDamage | 34.1% | 9.36 | 0.619 | 3 |
| PASS | Savage Opress | 1851 | health + health + health | 50.9% | 5.94 | 0.8095 | 3 |
| PASS | Taron Malicos | 1851 | health + offense | 65.5% | 3.34 | 0.9222 | 2 |
| PASS | Grand Moff Tarkin | 1850 | speed + potency | 38.0% | 6.68 | 0.7857 | 3 |
| PASS | Bastila Shan | 1849 | health + speed | 59.3% | 5.04 | 0.8503 | 2 |
| PASS | Shaak Ti | 1849 | health + speed | 70.6% | 3.34 | 0.9701 | 2 |
| PASS | CT-21-0408 "Echo" | 1847 | offense + critChance | 24.7% | 9.45 | 0.7785 | 3 |
| PASS | Padawan Sabine Wren | 1845 | offense + critChance | 46.8% | 6.41 | 0.5714 | 2 |
| PASS | The Mandalorian (Beskar Armor) | 1844 | health + offense | 51.9% | 6.05 | 0.7563 | 2 |
| PASS | Boss Nass | 1843 | speed + potency | 48.4% | 5.26 | 0.9581 | 3 |
| PASS | General Skywalker | 1843 | health + offense | 31.1% | 9.52 | 0.6905 | 3 |
| PASS | The Stranger | 1842 | health + speed | 76.5% | 2.64 | 0.9027 | 2 |
| PASS | Threepio & Chewie | 1842 | critChance + critDamage | 31.1% | 9.97 | 0.7857 | 2 |
| PASS | Jyn Erso | 1841 | speed + critChance | 32.0% | 9.94 | 0.7857 | 3 |
| PASS | Darth Vader (Duel's End) | 1839 | health + offense | 64.0% | 4.44 | 0.881 | 1 |
| PASS | Emperor Palpatine | 1839 | speed + potency | 51.7% | 6.94 | 0.8503 | 1 |
| PASS | Shin Hati | 1838 | health + offense | 45.3% | 5.92 | 0.7381 | 2 |
| PASS | Captain Silvo | 1837 | health + speed | 67.5% | 3.46 | 0.8982 | 2 |
| PASS | Darth Traya | 1835 | health + speed | 42.0% | 8.21 | 0.735 | 3 |
| PASS | Royal Guard | 1834 | health + health + health | 47.7% | 5.32 | 0.8743 | 3 |
| PASS | Commander Ahsoka Tano | 1833 | health + speed | 81.7% | 2.5 | 0.7545 | 1 |
| PASS | Skiff Guard (Lando Calrissian) | 1833 | offense + critChance | 57.9% | 5.85 | 0.7381 | 2 |
| PASS | Darth Nihilus | 1832 | health + speed | 36.7% | 8.32 | 0.8862 | 3 |
| PASS | Scout Trooper | 1831 | speed + potency | 62.7% | 5.12 | 0.5714 | 2 |
| PASS | Jango Fett | 1830 | critChance + critDamage | 43.0% | 8.88 | 0.5714 | 2 |
| PASS | Juhani | 1830 | health + health + health | 36.3% | 10.08 | 0.8503 | 3 |
| PASS | Aayla Secura | 1829 | critChance + critChance + potency | 27.8% | 16.69 | 0.7381 | 1 |
| PASS | Rey (Jedi Training) | 1829 | health + health + health | 29.1% | 11.77 | 0.8144 | 2 |
| PASS | Depa Billaba | 1827 | health + offense | 48.4% | 4.69 | 0.8571 | 2 |
| PASS | Han Solo | 1827 | critChance + critDamage | 53.1% | 5.73 | 0.6946 | 2 |
| PASS | Jedi Knight Revan | 1827 | health + speed | 65.3% | 4.26 | 0.8225 | 1 |
| PASS | Count Dooku | 1826 | speed + potency | 55.5% | 7.25 | 0.5714 | 2 |
| PASS | Darth Talon | 1824 | health + offense | 53.6% | 6.47 | 0.8916 | 2 |
| PASS | Jedi Knight Luke Skywalker | 1824 | offense + critChance | 53.1% | 4.49 | 0.8095 | 2 |
| PASS | Grand Inquisitor | 1823 | health + offense | 39.7% | 7.99 | 0.5714 | 3 |
| PASS | Ninth Sister | 1823 | health + health + health | 37.4% | 9.45 | 0.9286 | 2 |
| PASS | Visas Marr | 1823 | health + health + health | 50.8% | 4.1 | 0.8982 | 2 |
| PASS | Cassian Andor | 1821 | offense + potency | 29.1% | 10.42 | 0.6826 | 3 |
| PASS | Hermit Yoda | 1819 | health + speed | 75.9% | 2.92 | 0.7545 | 1 |
| PASS | Obi-Wan Kenobi (Old Ben) | 1819 | speed + potency | 21.6% | 13.36 | 0.9524 | 2 |
| PASS | Darth Sion | 1818 | health + speed | 29.4% | 10.09 | 0.8571 | 3 |
| PASS | Jedi Master Mace Windu | 1815 | health + offense | 55.3% | 4.44 | 0.8571 | 2 |
| PASS | Hera Syndulla | 1814 | health + speed | 45.3% | 7.15 | 0.5952 | 2 |
| PASS | Gungan Phalanx | 1813 | health + health + health | 45.6% | 7.19 | 0.8571 | 3 |
| PASS | Wat Tambor | 1813 | health + speed | 48.5% | 5.6 | 0.8024 | 2 |
| PASS | Boba Fett | 1811 | critChance + critDamage | 49.6% | 7.62 | 0.6826 | 2 |
| PASS | Bossk | 1811 | health + speed | 33.9% | 8.9 | 0.881 | 2 |
| PASS | Quiggold | 1810 | health + health + defense | 52.9% | 5.01 | 0.9762 | 3 |
| PASS | Brutus | 1809 | offense + critChance | 57.7% | 4.7 | 0.9524 | 2 |
| PASS | Geonosian Brood Alpha | 1809 | health + speed | 38.9% | 5.88 | 0.8783 | 3 |
| PASS | B2 Super Battle Droid | 1807 | potency + potency + potency | 24.9% | 15.22 | 0.9102 | 2 |
| PASS | Dash Rendar | 1804 | speed + critChance | 48.4% | 7.45 | 0.619 | 2 |
| PASS | Jocasta Nu | 1804 | health + offense | 43.6% | 5.94 | 0.8982 | 3 |
| PASS | Maul (Hate-Fueled) | 1801 | health + health + health | 82.9% | 2.3 | 0.9515 | 1 |
| PASS | The Mandalorian | 1800 | critChance + critDamage | 33.5% | 8.92 | 0.9222 | 2 |
| PASS | ARC Trooper | 1799 | health + offense | 44.1% | 4.47 | 0.7857 | 2 |
| PASS | Bastila Shan (Fallen) | 1799 | health + speed | 63.6% | 4.43 | 0.6946 | 2 |
| PASS | Sith Empire Trooper | 1799 | defense + defense + defense | 39.6% | 6.64 | 0.9222 | 3 |
| PASS | Sith Trooper | 1799 | health + offense | 28.7% | 7.95 | 0.8095 | 3 |
| PASS | Nightsister Spirit | 1798 | offense + potency | 45.2% | 7.65 | 0.5952 | 2 |
| PASS | Qui-Gon Jinn | 1797 | health + speed | 33.8% | 8.3 | 0.7066 | 3 |
| PASS | Gungan Boomadier | 1794 | offense + critChance | 30.4% | 10.54 | 0.6587 | 3 |
| PASS | Jar Jar Binks | 1794 | speed + potency | 64.5% | 4.19 | 0.7857 | 2 |
| PASS | Zorii Bliss | 1794 | health + speed | 47.2% | 5.25 | 0.7229 | 2 |
| PASS | Kix | 1792 | health + speed | 72.8% | 3.16 | 0.7591 | 2 |
| PASS | Pirate King Hondo Ohnaka | 1792 | health + speed | 70.4% | 2.91 | 0.8365 | 2 |
| PASS | Darth Revan | 1791 | health + speed | 61.4% | 4.61 | 0.5629 | 1 |
| PASS | Eighth Brother | 1791 | critChance + critDamage | 45.5% | 8.47 | 0.7711 | 2 |
| PASS | Mon Mothma | 1790 | speed + tenacity | 40.3% | 5.93 | 0.8383 | 2 |
| PASS | Inquisitor Barriss | 1789 | health + speed | 57.6% | 3.85 | 0.5904 | 2 |
| PASS | Dark Trooper Moff Gideon | 1787 | health + speed | 34.6% | 6.75 | 0.8862 | 2 |
| PASS | Embo | 1786 | critChance + critDamage | 55.5% | 6.26 | 0.9222 | 2 |
| PASS | Old Daka | 1784 | health + health + health | 67.9% | 3.58 | 0.8862 | 2 |
| PASS | IG-90 | 1783 | speed + tenacity | 38.7% | 7.53 | 0.8623 | 3 |
| PASS | Cara Dune | 1782 | health + health + health | 45.4% | 9.34 | 0.8571 | 2 |
| PASS | CT-7567 "Rex" | 1779 | health + speed | 76.2% | 3.08 | 0.6099 | 1 |
| PASS | Zaalbar | 1779 | health + health + health | 46.3% | 7.95 | 0.7619 | 2 |
| PASS | Greef Karga | 1778 | health + speed | 73.7% | 3.3 | 0.7186 | 1 |
| PASS | Chopper | 1777 | health + speed | 31.5% | 8.56 | 0.7857 | 3 |
| PASS | Satele Shan | 1775 | health + speed | 54.7% | 4.75 | 0.9762 | 3 |
| PASS | Stormtrooper Luke | 1774 | health + speed | 66.4% | 3.99 | 0.7306 | 1 |
| PASS | Asajj Ventress | 1773 | critChance + critDamage | 25.8% | 10.43 | 0.5988 | 3 |
| PASS | Kanan Jarrus | 1772 | health + health + health | 37.9% | 7.93 | 0.6905 | 3 |
| PASS | Saw Gerrera | 1771 | health + speed | 68.9% | 3.68 | 0.7109 | 2 |
| PASS | Vel Sartha | 1769 | health + health + defense | 30.9% | 9.68 | 0.7619 | 3 |
| PASS | 50R-T | 1768 | health + speed | 33.8% | 11.33 | 0.7306 | 3 |
| PASS | Mother Talzin | 1768 | offense + potency | 40.5% | 10.34 | 0.6429 | 1 |
| PASS | Resistance Hero Poe | 1768 | offense + potency | 44.9% | 8.51 | 0.5714 | 1 |
| PASS | Sabine Wren | 1768 | critChance + critDamage | 44.4% | 9.62 | 0.7785 | 1 |
| PASS | Iden Versio | 1767 | critDamage + potency | 35.0% | 10.8 | 0.5952 | 3 |
| PASS | Doctor Aphra | 1765 | potency + potency + potency | 64.1% | 3.49 | 0.7186 | 2 |
| PASS | Wrecker | 1765 | health + health + health | 31.2% | 10.94 | 0.7857 | 3 |
| PASS | Ki-Adi-Mundi | 1764 | offense + critChance | 39.2% | 6.6 | 0.6429 | 3 |
| PASS | Resistance Hero Finn | 1764 | health + speed | 47.6% | 5.02 | 0.7425 | 2 |
| PASS | Kleya Marki | 1763 | health + speed | 37.9% | 8.35 | 0.7143 | 3 |
| PASS | L3-37 | 1762 | health + health + health | 61.4% | 4.44 | 0.8982 | 2 |
| PASS | Echo | 1761 | speed + potency | 58.2% | 4.29 | 0.5904 | 2 |
| PASS | K-2SO | 1761 | tenacity + tenacity + tenacity | 33.0% | 9.6 | 0.9048 | 3 |
| PASS | Tech | 1760 | speed + potency | 63.7% | 4.29 | 0.6108 | 2 |
| PASS | Shoretrooper | 1759 | health + health + health | 61.9% | 4.34 | 0.8571 | 2 |
| PASS | Amilyn Holdo | 1755 | health + health + health | 61.1% | 5.47 | 0.6429 | 1 |
| PASS | Sith Marauder | 1755 | critChance + critDamage | 52.5% | 6.36 | 0.6383 | 2 |
| PASS | Sun Fac | 1754 | health + health + health | 32.2% | 10.01 | 0.881 | 3 |
| PASS | Captain Ithano | 1753 | offense + critChance | 54.9% | 5.53 | 0.7381 | 2 |
| PASS | Fennec Shand | 1753 | health + offense | 47.6% | 5.55 | 0.6587 | 3 |
| PASS | Poggle the Lesser | 1753 | health + speed | 41.4% | 7.4 | 0.7425 | 3 |
| PASS | Wrecker (Mercenary) | 1753 | health + health + tenacity | 38.6% | 7.92 | 0.9286 | 2 |
| PASS | Nute Gunray | 1752 | speed + potency | 44.8% | 6.51 | 0.7785 | 2 |
| PASS | Yoda & Chewie | 1752 | defense + speed | 28.5% | 7.55 | 0.8783 | 3 |
| PASS | First Order Stormtrooper | 1751 | defense + defense + defense | 26.2% | 7.8 | 0.881 | 3 |
| PASS | SM-33 | 1751 | health + offense | 70.0% | 3.71 | 0.7857 | 1 |
| PASS | Enfys Nest | 1750 | tenacity + tenacity + tenacity | 40.8% | 9.72 | 0.8144 | 3 |
| PASS | Major Partagaz | 1750 | health + speed | 46.6% | 4.3 | 0.9461 | 2 |
| PASS | KX Security Droid | 1748 | health + health + defense | 27.2% | 7.82 | 0.7066 | 3 |
| PASS | Grand Admiral Thrawn | 1746 | health + speed | 54.1% | 5.18 | 0.8743 | 2 |
| PASS | Baze Malbus | 1745 | health + health + health | 66.3% | 3.59 | 0.9701 | 2 |
| PASS | Dedra Meero | 1741 | health + speed | 74.5% | 3.1 | 0.8503 | 1 |
| PASS | Asajj Ventress (Dark Disciple) | 1739 | critChance + critDamage | 24.0% | 9.14 | 0.881 | 3 |
| PASS | IG-100 MagnaGuard | 1739 | health + health + health | 26.3% | 13.1 | 0.7143 | 2 |
| PASS | Omega (Fugitive) | 1738 | health + speed | 44.6% | 6.06 | 0.9701 | 2 |
| PASS | BT-1 | 1737 | offense + critChance | 66.9% | 3.84 | 0.8095 | 2 |
| PASS | Nightsister Zombie | 1734 | health + speed | 28.5% | 8.42 | 0.7425 | 3 |
| PASS | Rey (Scavenger) | 1734 | critChance + critDamage | 26.2% | 10.15 | 0.7066 | 3 |
| PASS | Death Trooper | 1733 | critChance + critDamage | 44.3% | 9.11 | 0.712 | 2 |
| PASS | Geonosian Soldier | 1733 | critChance + critDamage | 45.0% | 8.72 | 0.8333 | 2 |
| PASS | Darth Sidious | 1732 | potency + potency + potency | 28.5% | 9.97 | 0.7143 | 3 |
| PASS | Geonosian Spy | 1730 | critChance + critDamage | 64.8% | 4.64 | 0.881 | 1 |
| PASS | Hunter (Mercenary) | 1729 | speed + potency | 58.9% | 5.1 | 0.8144 | 2 |
| PASS | Ezra Bridger | 1725 | offense + critChance | 28.2% | 9.52 | 0.881 | 3 |
| PASS | General Veers | 1722 | speed + critChance | 23.2% | 11.95 | 0.6905 | 3 |
| PASS | First Order Officer | 1717 | speed + potency | 45.8% | 6.01 | 0.7381 | 2 |
| PASS | Grogu & Anzellans | 1717 | speed + tenacity | 29.2% | 6.24 | 0.8333 | 3 |
| PASS | BB-8 | 1713 | health + speed | 41.7% | 7.27 | 0.7186 | 2 |
| PASS | IG-11 | 1712 | health + health + health | 52.0% | 5.47 | 0.8051 | 2 |
| PASS | Tusken Chieftain | 1710 | health + speed | 43.6% | 6.31 | 0.8503 | 3 |
| PASS | Rotta the Hutt | 1709 | health + offense | 41.3% | 4.27 | 0.8916 | 2 |
| PASS | Dengar | 1707 | critChance + critDamage | 36.4% | 14.87 | 0.8503 | 1 |
| PASS | Second Sister | 1705 | offense + critChance | 47.1% | 8.14 | 0.6905 | 2 |
| PASS | Cinta Kaz | 1699 | health + offense | 34.7% | 7.49 | 0.8571 | 2 |
| PASS | Greedo | 1699 | critChance + critDamage | 45.4% | 10.95 | 0.8095 | 1 |
| PASS | Poe Dameron | 1696 | speed + potency | 46.0% | 9.24 | 0.7143 | 2 |
| PASS | Cassian Andor (Undercover) | 1694 | health + speed | 58.8% | 3.39 | 0.9701 | 2 |
| PASS | Gamorrean Guard | 1694 | health + health + health | 38.7% | 8.02 | 0.8571 | 3 |
| PASS | Luminara Unduli | 1692 | health + health + health | 58.6% | 3.89 | 0.8916 | 2 |
| PASS | R5-D4 | 1688 | speed + potency | 38.5% | 6.31 | 0.8743 | 3 |
| PASS | Darth Maul | 1687 | critChance + critDamage | 36.2% | 12.19 | 0.5749 | 1 |
| PASS | Maz Kanata | 1687 | health + speed | 68.3% | 3.61 | 0.8095 | 2 |
| PASS | Mission Vao | 1686 | critChance + critDamage | 48.8% | 7.75 | 0.7785 | 1 |
| PASS | Dark Trooper | 1682 | health + offense | 50.0% | 4.58 | 0.6587 | 3 |
| PASS | B1 Battle Droid | 1679 | offense + potency | 51.7% | 5.69 | 0.7785 | 2 |
| PASS | Colonel Starck | 1676 | health + speed | 32.6% | 8.43 | 0.5868 | 3 |
| PASS | Colonel Ward | 1671 | health + speed | 31.2% | 8.37 | 0.8571 | 3 |
| PASS | Cad Bane | 1670 | critChance + critDamage | 41.0% | 13.33 | 0.5749 | 1 |
| PASS | Chirrut Îmwe | 1670 | health + speed | 29.0% | 10.88 | 0.6667 | 3 |
| PASS | Tarfful | 1670 | health + health + defense | 41.7% | 7.11 | 0.9524 | 3 |
| PASS | First Order Executioner | 1668 | health + critDamage | 24.5% | 7.42 | 0.8095 | 3 |
| PASS | Droideka | 1667 | health + offense | 48.6% | 5.39 | 0.6667 | 2 |
| PASS | Zeb Orrelios (New Republic Pilot) | 1667 | health + health + defense | 53.6% | 5.28 | 0.9048 | 3 |
| PASS | Captain Phasma | 1666 | health + speed | 35.7% | 7.71 | 0.619 | 3 |
| PASS | Chief Nebit | 1666 | health + health + health | 62.1% | 4.67 | 0.8571 | 2 |
| PASS | The Armorer | 1666 | health + speed | 66.8% | 4.19 | 0.6826 | 1 |
| PASS | Gar Saxon | 1663 | tenacity + tenacity + tenacity | 24.6% | 13.62 | 0.6826 | 2 |
| PASS | Rose Tico | 1660 | health + speed | 24.2% | 15.14 | 0.7381 | 2 |
| PASS | IG-88 | 1657 | critChance + critDamage | 44.2% | 11.06 | 0.8333 | 2 |
| PASS | Stormtrooper Han | 1655 | health + health + health | 24.1% | 10.97 | 0.8333 | 3 |
| PASS | Stormtrooper | 1653 | defense + defense + defense | 38.0% | 7.16 | 0.8333 | 3 |
| PASS | First Order TIE Pilot | 1652 | critChance + critDamage | 50.7% | 7.69 | 0.7857 | 2 |
| PASS | URoRRuR'R'R | 1652 | health + speed | 51.2% | 6.71 | 0.7186 | 2 |
| PASS | Bistan | 1650 | potency + potency + potency | 33.2% | 14.27 | 0.5714 | 1 |
| PASS | First Order SF TIE Pilot | 1650 | critChance + critDamage | 49.1% | 9.42 | 0.5714 | 1 |
| PASS | Princess Leia | 1650 | critChance + critDamage | 54.3% | 6.86 | 0.881 | 1 |
| PASS | Boba Fett, Scion of Jango | 1649 | offense + critChance | 37.3% | 7.22 | 0.7785 | 3 |
| PASS | Garazeb "Zeb" Orrelios | 1646 | health + critDamage | 31.0% | 13.55 | 0.7381 | 2 |
| PASS | Coruscant Underworld Police | 1643 | speed + potency | 38.2% | 10.64 | 0.6429 | 2 |
| PASS | Princess Kneesaa | 1640 | critChance + critDamage | 48.5% | 8.37 | 0.619 | 1 |
| PASS | Tusken Warrior | 1637 | critChance + critDamage | 48.6% | 7.81 | 0.6667 | 2 |
| PASS | Zuckuss | 1637 | speed + tenacity | 46.2% | 7.66 | 0.6905 | 3 |
| PASS | Aurra Sing | 1634 | critChance + critDamage | 49.1% | 8.56 | 0.5952 | 1 |
| PASS | HK-47 | 1634 | critChance + critDamage | 48.2% | 7.34 | 0.8333 | 3 |
| PASS | Imperial Super Commando | 1628 | offense + potency | 24.2% | 11.87 | 0.6905 | 3 |
| PASS | Mob Enforcer | 1628 | speed + potency | 42.6% | 10.24 | 0.6905 | 1 |
| PASS | Jawa Scavenger | 1626 | speed + potency | 29.5% | 11.24 | 0.8743 | 2 |
| PASS | Qi'ra | 1625 | speed + critChance | 44.5% | 8.74 | 0.7545 | 2 |
| PASS | Vandor Chewbacca | 1624 | health + health + health | 79.2% | 2.86 | 0.8264 | 1 |
| PASS | Director Krennic | 1621 | speed + critChance | 37.6% | 11.09 | 0.6266 | 3 |
| PASS | Crosshair (Scarred) | 1619 | offense + critChance | 45.6% | 7.17 | 0.7066 | 2 |
| PASS | Captain Han Solo | 1607 | health + speed | 36.5% | 6.98 | 0.7143 | 2 |
| PASS | Tusken Shaman | 1606 | speed + potency | 41.8% | 7.48 | 0.7143 | 3 |
| PASS | Chief Chirpa | 1597 | health + speed | 34.7% | 9.73 | 0.7143 | 3 |
| PASS | Rebel Officer Leia Organa | 1596 | critChance + critDamage | 36.0% | 15.79 | 0.5952 | 1 |
| PASS | Scarif Rebel Pathfinder | 1595 | health + health + health | 36.3% | 8.9 | 0.5714 | 3 |
| PASS | Cobb Vanth | 1591 | health + speed | 37.8% | 9.12 | 0.8383 | 2 |
| PASS | Leia (Jedi Training) | 1591 | health + offense | 38.9% | 7.6 | 0.9286 | 3 |
| PASS | Snowtrooper Commander | 1585 | health + speed | 32.9% | 7.31 | 0.8982 | 3 |
| PASS | T3-M4 | 1580 | speed + potency | 23.1% | 12.86 | 0.7857 | 3 |
| PASS | Admiral Trench | 1579 | health + speed | 54.9% | 6.38 | 0.9286 | 2 |
| PASS | Wedge Antilles | 1577 | critChance + critDamage | 44.3% | 9.66 | 0.6905 | 2 |
| PASS | Omega | 1572 | critChance + critDamage | 41.6% | 10.19 | 0.7143 | 2 |
| PASS | Imperial Probe Droid | 1567 | speed + potency | 51.0% | 6.65 | 0.9027 | 2 |
| PASS | Biggs Darklighter | 1562 | critChance + critDamage | 43.1% | 10.17 | 0.7143 | 2 |
| PASS | Wicket | 1560 | critChance + critDamage | 50.9% | 7.5 | 0.7857 | 2 |
| PASS | Kuiil | 1558 | health + speed | 37.7% | 6.39 | 0.7075 | 3 |
| PASS | CC-2224 "Cody" | 1546 | speed + critChance | 41.3% | 10.67 | 0.6108 | 2 |
| PASS | Admiral Ackbar | 1534 | health + speed | 45.9% | 8.91 | 0.5952 | 2 |
| PASS | Ewok Elder | 1526 | health + speed | 44.6% | 5.32 | 0.7904 | 2 |
| PASS | Veteran Smuggler Han Solo | 1525 | critChance + critDamage | 41.0% | 11.37 | 0.5868 | 1 |
| PASS | Paploo | 1524 | health + health + health | 20.5% | 10.92 | 0.619 | 3 |
| PASS | Jawa Engineer | 1515 | health + speed | 28.1% | 8.31 | 0.5629 | 3 |
| PASS | Lando Calrissian | 1515 | critChance + critDamage | 54.5% | 7.1 | 0.7857 | 1 |
| PASS | Captain Carson Teva | 1499 | offense + critChance | 49.8% | 6.49 | 0.881 | 2 |
| PASS | Snowtrooper | 1494 | critChance + critDamage | 52.1% | 7.4 | 0.7857 | 2 |
| PASS | Magmatrooper | 1490 | offense + tenacity | 34.3% | 14.75 | 0.7619 | 1 |
| PASS | Clone Sergeant - Phase I | 1489 | critChance + critDamage | 44.7% | 10.21 | 0.6429 | 1 |
| PASS | Bodhi Rook | 1486 | speed + potency | 39.5% | 9.43 | 0.7857 | 3 |
| PASS | Resistance Trooper | 1485 | offense + potency | 25.8% | 14.24 | 0.6905 | 2 |
| PASS | Logray | 1484 | speed + potency | 20.2% | 17.1 | 0.7857 | 2 |
| PASS | Dathcha | 1473 | health + health + health | 36.2% | 10.74 | 0.7381 | 2 |
| PASS | Talia | 1454 | health + speed | 40.6% | 6.28 | 0.6108 | 2 |
| PASS | Jedi Consular | 1442 | health + health + health | 53.7% | 4.92 | 0.6667 | 2 |
| PASS | Young Han Solo | 1422 | offense + critChance | 39.7% | 9.71 | 0.6429 | 3 |
| PASS | Ugnaught | 1413 | health + speed | 28.7% | 8.89 | 0.6905 | 3 |
| PASS | Hoth Rebel Scout | 1412 | critChance + critDamage | 31.5% | 14.22 | 0.5714 | 2 |
| PASS | Nightsister Acolyte | 1386 | critChance + critDamage | 41.3% | 10.09 | 0.8333 | 2 |
| PASS | Teebo | 1367 | potency + potency + potency | 34.7% | 11.18 | 0.7381 | 3 |
| PASS | Luke Skywalker (Farmboy) | 1363 | critChance + critDamage | 29.9% | 12.68 | 0.6905 | 2 |
| PASS | Ima-Gun Di | 1297 | health + health + health | 63.6% | 5.96 | 0.5988 | 1 |
| PASS | IG-86 Sentinel Droid | 1146 | critChance + critDamage | 37.9% | 11.11 | 0.5952 | 2 |

# Detailed Validation

## Hunter (`BADBATCHHUNTER`)

**Overall status:** WARN

Samples: **1686**  
Average relic: **5.5913**

### Loadout distribution

Classification: **highly multimodal**

Top build share: **48.2%**  
Top-three share: **67.6%**  
Effective number of loadouts: **7.68**  
Normalized entropy: **0.5565**

| Rank | Loadout | Count | Share |
| ---: | --- | ---: | ---: |
| 1 | critChance + critDamage | 812 | 48.2% |
| 2 | health + offense | 221 | 13.1% |
| 3 | health + speed | 106 | 6.3% |
| 4 | offense + critChance | 94 | 5.6% |
| 5 | health + critDamage | 84 | 5.0% |
| 6 | health + health + health | 72 | 4.3% |
| 7 | speed + potency | 55 | 3.3% |
| 8 | offense + potency | 39 | 2.3% |

### Aggregate Kyber Meta weights

| Stat | Weight | Empirical secondary signal |
| --- | ---: | ---: |
| speed | 100 | 0.19305 |
| offense | 47 | 0.073816 |
| critDmg | 40 | — |
| health | 39 | 0.066679 |
| protection | 37 | 0.067451 |
| critChance | 34 | 0.075516 |
| potency | 22 | 0.073078 |
| tenacity | 17 | 0.071133 |
| defense | 14 | 0.060453 |
| accuracy | 0 | — |
| critAvoid | 0 | — |

Secondary-rank Spearman correlation: **0.5476**

### Aggregate primary consensus

| Slot | Samples | Winner | Winner Share | Runner-up | Margin | Expected Restriction | Generated Restriction |
| --- | ---: | --- | ---: | --- | ---: | --- | --- |
| arrow | 1686 | Speed | 90.5% | Offense % | 85.9% | Speed | Speed |
| triangle | 1686 | Critical Damage % | 43.6% | Offense % | 15.1% | Any | Any |
| circle | 1686 | Protection % | 62.9% | Health % | 25.7% | Any | Any |
| cross | 1686 | Offense % | 51.9% | Potency % | 37.2% | Any | Any |

### Generated archetypes

| Loadout | Share | Samples | Set Match | Weight Correlation |
| --- | ---: | ---: | --- | ---: |
| 5-6 | 48.2% | 812 | PASS | 0.5238 |
| 1-2 | 13.1% | 221 | PASS | 0.503 |

### Validation checks

- **PASS** — Generated sample size matches raw sample size (1686).
- **INFO** — highly multimodal; top build 48.2%, top three 67.6%, effective loadouts 7.68.
- **PASS** — Aggregate Kyber Meta target correctly leaves set choice unrestricted.
- **PASS** — arrow: correctly restricted to Speed.
- **PASS** — triangle: correctly left unrestricted.
- **PASS** — circle: correctly left unrestricted.
- **PASS** — cross: correctly left unrestricted.
- **PASS** — All generated weights are finite and inside the expected -100..100 range.
- **PASS** — Target has a normalized maximum weight of 100.
- **WARN** — Generated stat ranking has only moderate agreement with observed secondary behavior (Spearman 0.548).
- **PASS** — 5-6: set restrictions correctly match the raw loadout.
- **PASS** — 1-2: set restrictions correctly match the raw loadout.
- **PASS** — Generated 2 expected loadout archetype target(s).

## R2-D2 (`R2D2_LEGENDARY`)

**Overall status:** PASS

Samples: **1900**  
Average relic: **8.41**

### Loadout distribution

Classification: **highly multimodal**

Top build share: **31.5%**  
Top-three share: **67.6%**  
Effective number of loadouts: **7.79**  
Normalized entropy: **0.5872**

| Rank | Loadout | Count | Share |
| ---: | --- | ---: | ---: |
| 1 | health + offense | 598 | 31.5% |
| 2 | speed + potency | 405 | 21.3% |
| 3 | health + health + health | 282 | 14.8% |
| 4 | health + speed | 271 | 14.3% |
| 5 | health + health + potency | 72 | 3.8% |
| 6 | offense + potency | 45 | 2.4% |
| 7 | speed + critChance | 32 | 1.7% |
| 8 | health + potency + potency | 28 | 1.5% |

### Aggregate Kyber Meta weights

| Stat | Weight | Empirical secondary signal |
| --- | ---: | ---: |
| speed | 100 | 0.238693 |
| health | 60 | 0.082261 |
| offense | 36 | 0.088602 |
| potency | 29 | 0.093663 |
| protection | 20 | 0.073803 |
| critChance | 16 | 0.076608 |
| tenacity | 13 | 0.074103 |
| defense | 11 | 0.066948 |
| critDmg | 0 | — |
| accuracy | 0 | — |
| critAvoid | 0 | — |

Secondary-rank Spearman correlation: **0.8333**

### Aggregate primary consensus

| Slot | Samples | Winner | Winner Share | Runner-up | Margin | Expected Restriction | Generated Restriction |
| --- | ---: | --- | ---: | --- | ---: | --- | --- |
| arrow | 1900 | Speed | 78.6% | Health % | 64.6% | Any | Any |
| triangle | 1900 | Health % | 45.7% | Offense % | 24.2% | Any | Any |
| circle | 1900 | Health % | 70.3% | Protection % | 40.6% | Any | Any |
| cross | 1900 | Health % | 41.9% | Potency % | 19.5% | Any | Any |

### Generated archetypes

| Loadout | Share | Samples | Set Match | Weight Correlation |
| --- | ---: | ---: | --- | ---: |
| 1-2 | 31.5% | 598 | PASS | 0.9524 |
| 4-7 | 21.3% | 405 | PASS | 0.5988 |
| 1-1-1 | 14.8% | 282 | PASS | 0.9222 |

### Validation checks

- **PASS** — Generated sample size matches raw sample size (1900).
- **INFO** — highly multimodal; top build 31.5%, top three 67.6%, effective loadouts 7.79.
- **PASS** — Aggregate Kyber Meta target correctly leaves set choice unrestricted.
- **PASS** — arrow: correctly left unrestricted.
- **PASS** — triangle: correctly left unrestricted.
- **PASS** — circle: correctly left unrestricted.
- **PASS** — cross: correctly left unrestricted.
- **PASS** — All generated weights are finite and inside the expected -100..100 range.
- **PASS** — Target has a normalized maximum weight of 100.
- **PASS** — Generated stat ranking agrees well with observed secondary behavior (Spearman 0.833).
- **PASS** — 1-2: set restrictions correctly match the raw loadout.
- **PASS** — 4-7: set restrictions correctly match the raw loadout.
- **PASS** — 1-1-1: set restrictions correctly match the raw loadout.
- **PASS** — Generated 3 expected loadout archetype target(s).

