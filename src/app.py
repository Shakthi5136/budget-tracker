from flask import Flask, jsonify, request
import random
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

financial_tips = {
    "budgeting": [
        "Track your spending to improve your finances.",
        "Create a budget and stick to it."
    ],
    "investment": [
        "Diversify your investments to reduce risk.",
        "Invest for the long term."
    ],
    "savings": [
        "Save at least 10% of your income.",
        "Build an emergency fund."
    ],
    "debt management": [
        "Pay off high-interest debt first.",
        "Avoid taking on unnecessary debt."
    ],
    "retirement": [
        "Start saving for retirement early.",
        "Consider a mix of 401(k) and IRA accounts."
    ]
}

@app.route('/tips', methods=['GET'])
def get_random_tip():
    category = random.choice(list(financial_tips.keys()))
    tip = random.choice(financial_tips[category])
    return jsonify({"tip": tip, "category": category})


if __name__ == '__main__':
    app.run(debug=True, port=5001)
