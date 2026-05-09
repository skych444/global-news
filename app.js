document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const navItems = document.querySelectorAll('.nav-item');
    const pushBtn = document.getElementById('push-btn');
    const installBtn = document.getElementById('install-btn');
    const themeBtn = document.getElementById('theme-btn');
    const articlesContainer = document.getElementById('articles-container');
    const loader = document.getElementById('loader');
    const newsFeed = document.getElementById('news-feed');
    const ptrIndicator = document.getElementById('ptr-indicator');
    const refreshBtn = document.getElementById('refresh-btn');

    // --- State ---
    let currentCategory = 'world';
    let isRefreshing = false;
    let startY = 0;
    let pullDist = 0;
    const PULL_THRESHOLD = 80;

    // --- Pull to Refresh Logic ---
    newsFeed.addEventListener('touchstart', (e) => {
        if (window.scrollY <= 5) {
            startY = e.touches[0].pageY;
        }
    }, { passive: true });

    newsFeed.addEventListener('touchmove', (e) => {
        if (startY === 0 || isRefreshing) return;
        
        const currentY = e.touches[0].pageY;
        pullDist = currentY - startY;

        if (pullDist > 0 && window.scrollY <= 5) {
            document.body.classList.add('ptr-active');
            // Resistance effect
            const rotate = Math.min(pullDist * 2, 360);
            ptrIndicator.querySelector('.ptr-spinner').style.transform = `rotate(${rotate}deg)`;
            
            if (pullDist > PULL_THRESHOLD) {
                ptrIndicator.style.transform = `translateY(0) scale(1.2)`;
            } else {
                ptrIndicator.style.transform = `translateY(0) scale(1)`;
            }
        }
    }, { passive: true });

    newsFeed.addEventListener('touchend', async () => {
        if (pullDist > PULL_THRESHOLD && !isRefreshing) {
            startRefresh();
        } else {
            resetPtr();
        }
    });

    async function startRefresh() {
        isRefreshing = true;
        document.body.classList.add('ptr-refreshing');
        
        // Haptic feedback if available
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(10);
        }

        await fetchNews(currentCategory);
        
        setTimeout(() => {
            resetPtr();
        }, 500);
    }

    function resetPtr() {
        isRefreshing = false;
        startY = 0;
        pullDist = 0;
        document.body.classList.remove('ptr-active', 'ptr-refreshing');
        ptrIndicator.style.transform = '';
        ptrIndicator.querySelector('.ptr-spinner').style.transform = '';
    }

    // --- Refresh Button Logic ---
    refreshBtn.addEventListener('click', () => {
        const icon = refreshBtn.querySelector('i');
        icon.style.transition = 'transform 0.6s ease';
        icon.style.transform = 'rotate(360deg)';
        
        fetchNews(currentCategory);
        
        setTimeout(() => {
            icon.style.transition = 'none';
            icon.style.transform = 'rotate(0deg)';
        }, 600);
    });

    // --- Theme Logic ---
    const themeIcon = themeBtn.querySelector('i');
    
    // Check saved theme
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.classList.replace('ri-sun-line', 'ri-moon-line');
    }

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        if (document.body.classList.contains('light-mode')) {
            themeIcon.classList.replace('ri-sun-line', 'ri-moon-line');
            localStorage.setItem('theme', 'light');
        } else {
            themeIcon.classList.replace('ri-moon-line', 'ri-sun-line');
            localStorage.setItem('theme', 'dark');
        }
    });

    // --- Category Switching ---
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            const target = e.currentTarget;
            target.classList.add('active');

            // Update Category
            currentCategory = target.dataset.category;

            // Fetch new data
            fetchNews(currentCategory);
        });
    });

    // --- Install PWA Logic ---
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI notify the user they can add to home screen
        installBtn.classList.remove('hidden');
    });

    installBtn.addEventListener('click', (e) => {
        installBtn.classList.add('hidden');
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                } else {
                    console.log('User dismissed the A2HS prompt');
                }
                deferredPrompt = null;
            });
        }
    });

    // --- Push Notifications Logic ---
    // Note: VAPID public key needed for real implementation
    const publicVapidKey = 'REPLACE_WITH_YOUR_VAPID_PUBLIC_KEY';

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    pushBtn.addEventListener('click', async () => {
        if (!('Notification' in window)) {
            alert('Ce navigateur ne supporte pas les notifications push.');
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            subscribeUserToPush();
        } else {
            console.warn('Notification permission denied.');
            alert('Vous avez refusé les notifications.');
        }
    });

    async function subscribeUserToPush() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.ready;
                console.log('Service Worker is ready, subscribing...');

                // --- SOLUTION SANS SERVEUR : ONESIGNAL ---
                // Puisque vous n'avez pas de serveur, la solution gratuite la plus simple 
                // est d'utiliser OneSignal (onesignal.com).
                // Vous n'aurez pas besoin de cette fonction 'subscribeUserToPush'.
                // Il suffira d'ajouter le script OneSignal qu'ils vous donneront dans index.html.

                alert('Autorisation accordée ! Pour recevoir de vraies notifications sans payer de serveur, je vous recommande de créer un compte gratuit sur OneSignal.com');

                // Demo local notification (requires permission which we just got)
                registration.showNotification('Bienvenue sur Global News', {
                    body: 'Ceci est un test local. Intégrez OneSignal pour les vraies alertes !',
                    icon: './assets/icons/icon-512x512.png'
                });

            } catch (error) {
                console.error('Failed to subscribe user: ', error);
            }
        }
    }

    // Formatting Date logic (e.g. "Aujourd'hui à 14:30" or "09 Mai, 14:30")
    function formatNewsDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMs / 3600000);

        const timeOpts = { hour: '2-digit', minute: '2-digit' };
        const timeStr = date.toLocaleTimeString('fr-FR', timeOpts);

        if (date.toDateString() === now.toDateString()) {
            if (diffMins < 60) {
                return `Il y a ${diffMins} min`;
            }
            return `Aujourd'hui, ${timeStr}`;
        }

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return `Hier, ${timeStr}`;
        }

        const dateOpts = { day: '2-digit', month: 'short' };
        return `${date.toLocaleDateString('fr-FR', dateOpts)}, ${timeStr}`;
    }

    function renderArticles(articles) {
        articlesContainer.innerHTML = ''; // Clear current

        if (!articles || articles.length === 0) {
            articlesContainer.innerHTML = `
                <div class="error-message">
                    <i class="ri-error-warning-line" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    <p>Aucune actualité trouvée pour cette catégorie.</p>
                </div>
            `;
            return;
        }

        articles.forEach(article => {
            const dateStr = formatNewsDate(article.publishedAt);
            const sourceName = article.source.name || 'AFP / News';
            const imageUrl = article.image || article.urlToImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'; // Fallback image

            const card = document.createElement('a');
            card.href = article.url;
            card.className = 'news-card';

            card.innerHTML = `
                <div class="card-img-container">
                    <img src="${imageUrl}" alt="News Image" class="card-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'">
                </div>
                <div class="card-content">
                    <div class="card-meta">
                        <span class="source-badge">${sourceName}</span>
                        <span class="card-time"><i class="ri-time-line"></i> ${dateStr}</span>
                    </div>
                    <h3 class="card-title">${article.title}</h3>
                    <p class="card-desc">${article.description || ''}</p>
                </div>
            `;
            articlesContainer.appendChild(card);
        });
    }

    async function fetchRssFeed(rssUrl) {
        // Utilisation de l'API rss2json.com (convertit le RSS en JSON et gère le CORS)
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Erreur réseau lors de la récupération du flux RSS');
        
        const data = await response.json();
        if (data.status !== 'ok') throw new Error('Erreur dans la lecture du flux RSS');
        
        return data.items.map(item => {
            // Nettoyer les balises HTML de la description
            const div = document.createElement('div');
            div.innerHTML = item.description || '';
            const description = div.textContent || div.innerText || '';
            
            // Extraire l'image (enclosure, thumbnail, ou fallback)
            let fallbackImage = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
            if (rssUrl.includes('bourse') || rssUrl.includes('cac40')) {
                fallbackImage = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
            } else if (rssUrl.includes('economie') || rssUrl.includes('business') || rssUrl.includes('tribune')) {
                fallbackImage = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'; // Eco fallback
            }
            
            let imageUrl = fallbackImage; 
            if (item.enclosure && item.enclosure.link) {
                imageUrl = item.enclosure.link;
            } else if (item.thumbnail) {
                imageUrl = item.thumbnail;
            } else {
                // Try to find image in HTML description or content
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = item.description || item.content || '';
                const img = tempDiv.querySelector('img');
                // Avoid tiny tracking pixels (usually < 10px)
                if (img && img.src && !img.src.includes('smartadserver') && !img.src.includes('xiti')) {
                    imageUrl = img.src;
                }
            }
            
            let sourceName = 'Actualités';
            if (rssUrl.includes('lemonde.fr')) sourceName = 'Le Monde';
            else if (rssUrl.includes('france24')) sourceName = 'France 24';
            else if (rssUrl.includes('bfmtv')) sourceName = 'BFM TV';
            else if (rssUrl.includes('closermag')) sourceName = 'Closer';
            else if (rssUrl.includes('ozap')) sourceName = 'PureMédias';
            else if (rssUrl.includes('lefigaro')) sourceName = 'Le Figaro';
            
            // Conversion de la date pour correspondre au format précédent
            // rss2json renvoie souvent "YYYY-MM-DD HH:MM:SS"
            let isoDate = new Date().toISOString();
            if (item.pubDate) {
                const parsedDate = new Date(item.pubDate.replace(' ', 'T') + 'Z');
                if (!isNaN(parsedDate)) isoDate = parsedDate.toISOString();
            }
            
            return {
                title: item.title || '',
                description: description.substring(0, 150) + '...',
                publishedAt: isoDate,
                url: item.link || '#',
                image: imageUrl,
                source: { name: sourceName }
            };
        });
    }

    async function fetchNews(category) {
        articlesContainer.innerHTML = '';
        loader.classList.remove('hidden');

        try {
            // Liste des flux RSS par catégorie (Multi-sources pour plus de robustesse)
            let rssUrls = [];
            if (category === 'world') {
                rssUrls = [
                    'https://www.lemonde.fr/international/rss_full.xml',
                    'https://www.france24.com/fr/monde/rss',
                    'https://www.lefigaro.fr/rss/figaro_international.xml'
                ];
            } else if (category === 'france') {
                rssUrls = [
                    'https://www.leparisien.fr/arc/outboundfeeds/rss/all/',
                    'https://www.lemonde.fr/france/rss_full.xml',
                    'https://www.lefigaro.fr/rss/figaro_actualites.xml',
                    'https://www.france24.com/fr/france/rss'
                ];
            } else if (category === 'business') {
                rssUrls = [
                    'https://www.lemonde.fr/economie/rss_full.xml',
                    'https://www.lefigaro.fr/rss/figaro_economie.xml',
                    'https://www.france24.com/fr/eco-tech/rss',
                    'https://www.latribune.fr/feed.xml'
                ];
            } else if (category === 'bourse') {
                // Sources testées et vérifiées comme fonctionnelles via rss2json
                rssUrls = [
                    'https://www.bfmtv.com/rss/economie/',
                    'https://www.lemonde.fr/argent/rss_full.xml'
                ];
            } else if (category === 'people') {
                rssUrls = [
                    'https://www.20minutes.fr/feeds/rss-people.xml',
                    'https://www.voici.fr/rss'
                ];
            } else if (category === 'media') {
                rssUrls = [
                    'https://www.lefigaro.fr/rss/figaro_medias.xml',
                    'https://www.ozap.com/news.rss' // PureMédias
                ];
            }

            // Récupération de tous les flux en parallèle
            const fetchPromises = rssUrls.map(url => fetchRssFeed(url).catch(e => {
                console.error("Erreur sur le flux " + url, e);
                return []; // En cas d'erreur sur un flux, on ignore et on retourne un tableau vide
            }));
            
            const results = await Promise.all(fetchPromises);
            
            // Fusion des articles
            let articles = [];
            results.forEach(res => { articles = articles.concat(res); });
            
            // Retirer les éventuels doublons (basé sur le titre)
            articles = articles.filter((article, index, self) =>
                index === self.findIndex((t) => (t.title === article.title))
            );

            // FILTRE STRICT FRANÇAIS : On vérifie la présence de caractères ou mots français
            const frenchIndicators = ['le', 'la', 'les', 'est', 'un', 'une', 'du', 'des', 'au', 'aux', 'par', 'pour', 'é', 'à', 'è'];
            articles = articles.filter(article => {
                const text = (article.title + ' ' + (article.description || '')).toLowerCase();
                // On accepte aussi les articles très courts de bourse qui contiennent souvent des chiffres et des %
                if (category === 'bourse' && (text.includes('%') || text.includes('pts') || text.includes('cac'))) return true;
                return frenchIndicators.some(ind => text.includes(ind));
            });
            
            // Trier par date la plus récente
            articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
            
            renderArticles(articles);

        } catch (error) {
            console.error('Error fetching news:', error);
            loader.classList.add('hidden');
            articlesContainer.innerHTML = `
                <div class="error-message">
                    <i class="ri-wifi-off-line" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    <p>Erreur lors de la récupération des actualités. Veuillez vérifier votre réseau ou recharger la page.</p>
                </div>
            `;
        } finally {
            loader.classList.add('hidden');
        }
    }

    // Generator for mock news matching AFP style
    function generateMockNews(category) {
        const now = new Date();
        const data = [];
        const numItems = 10;

        const titles = {
            world: [
                "Sommet international sur le climat : un accord historique signé à Genève",
                "Tensions en mer de Chine : déploiement naval massif",
                "Découverte d'une exoplanète potentiellement habitable par le télescope James Webb",
                "Crise économique mondiale : les banques centrales annoncent de nouvelles mesures",
                "Séisme de magnitude 7.2 au Japon, alerte tsunami déclenchée",
                "Élections présidentielles : résultats serrés dans la plus grande démocratie d'Amérique Latine",
                "L'ONU s'inquiète de la situation humanitaire grandissante dans l'est de l'Afrique",
                "Avancée majeure dans la recherche sur la fusion nucléaire",
                "Le G20 s'accorde sur une taxation minimale mondiale des multinationales",
                "Première mission habitée vers Mars planifiée pour 2030"
            ],
            france: [
                "Manifestations à Paris : le gouvernement annonce un recul sur la réforme",
                "Le CAC 40 atteint un niveau record historique ce matin",
                "Déploiement massif de la 5G : couverture de 90% du territoire atteinte",
                "Nouvelles mesures annoncées pour le pouvoir d'achat des ménages",
                "Un été caniculaire : Météo France place 25 départements en vigilance rouge",
                "Innovation : une startup française lève 500 millions d'euros",
                "Rencontre au sommet entre le Président et les syndicats",
                "Grève des transports prévue pour ce weekend : prévisions de trafic",
                "Succès pour le lancement de la fusée Ariane 6 depuis Kourou",
                "Cérémonie d'ouverture exceptionnelle annoncée pour le prochain grand événement sportif"
            ],
            business: [
                "Acquisition majeure : TechCorp rachète son principal concurrent pour 44 milliards",
                "L'intelligence artificielle générative booste les bénéfices des géants du net",
                "Pénurie de semi-conducteurs : les constructeurs automobiles au ralenti",
                "La crypto-monnaie phare franchit un nouveau cap symbolique",
                "Une grande banque annonce un vaste plan de restructuration mondial",
                "Lancement réussi de la nouvelle gamme de véhicules électriques",
                "Nouveaux records de ventes pour les secteurs du luxe",
                "La transition écologique au cœur des stratégies des grandes entreprises du CAC",
                "Startup Nation : la France compte désormais 30 licornes",
                "Inflation : les distributeurs s'engagent sur le blocage des prix"
            ]
        };

        const images = [
            "https://images.unsplash.com/photo-1529245005537-8fbafcecdbb7?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80"
        ];

        for (let i = 0; i < numItems; i++) {
            const pubDate = new Date(now.getTime() - Math.random() * 86400000 * 2); // Random within last 48h

            data.push({
                title: titles[category][i] || "Titre de l'actualité",
                description: "Une dépêche urgente vient de tomber concernant ce sujet crucial. Découvrez les détails de cette information qui fait la Une en ce moment même.",
                publishedAt: pubDate.toISOString(),
                source: { name: ["AFP", "Reuters", "AP", "Bloomberg", "Le Monde"][Math.floor(Math.random() * 5)] },
                url: "#",
                image: images[Math.floor(Math.random() * images.length)]
            });
        }

        // Sort by date descending
        data.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        return data;
    }

    // --- Initial Load ---
    fetchNews(currentCategory);
});
