import requests

# URL de ton API
API_URL = 'http://localhost:3000/scrape'

# Données à envoyer
data_ = {
    'url': 'https://www.amazon.fr/Tout-sur-business-ligne-Dropshipping/dp/B0CR812LVG/ref=sr_1_3_sspa?dib=eyJ2IjoiMSJ9.e3uuYLGcCEm3WM3r8t82kmcrG-cQvqybNNtDzxqaFu5y2A1BSN_kZwOPKkweSHfuxuRlZRvBm3RsrK6i9hCTMJZ1BHrl4Bajh343UQ9_AFdSUfgAEfWkhxNCvyqCkq6z6E6We6imobt5Iq6kPLSd8BjAspzGq_CmTl7wKraAelqrg7AImpe24OCGI6fUhJMtkHO5b0Trn7rzykP6C25Ue5KmoOW_0Fq6jWmaWg6sejcsfluzY4FBNf0w4peVTrjfiDZ9sYGl8w_CsfYPACi7GQvUfDQA-10MwQXjOtGqBHg.VTHYxI0VdWCCasaizRu3snaWeyYeC4xh3Mh9xwcOAOk&dib_tag=se&keywords=livre+sur+le+marketing&qid=1749819495&sr=8-3-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1'
}

data = {
  "url": "https://www.cdiscount.com/informatique/ordinateurs-pc-portables/pc-portable-hp-15-fc0071nf-windows-11-15-6-fh/f-1070992-hp15fc0071nf.html?idOffre=2491235745#cm_sp=VI:6041073:3:HP15FC0071NF"
}

def main():
    try:
        response = requests.post(API_URL, json=data)
        response.raise_for_status()

        result = response.json()
        print("Résultat du scraping :")
        print(result)

    except requests.exceptions.RequestException as e:
        print(f"Erreur lors de la requête : {e}")
    except ValueError:
        print("Réponse non JSON valide.")

if __name__ == "__main__":
    main()
