import requests

# URL de ton API
API_URL = 'http://localhost:3000/scrape'

# Données à envoyer
data = {
    'url': 'https://www.amazon.fr/Tout-sur-business-ligne-Dropshipping/dp/B0CR812LVG'
}

def main():
    try:
        response = requests.post(API_URL, json=data)
        response.raise_for_status()

        result = response
        print("Résultat du scraping :")
        print(result)

    except requests.exceptions.RequestException as e:
        print(f"Erreur lors de la requête : {e}")
    except ValueError:
        print("Réponse non JSON valide.")

if __name__ == "__main__":
    main()
