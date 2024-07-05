from flask import Flask, jsonify, request
import random

app = Flask(__name__)

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

@app.route('/tips/category/<category>', methods=['GET'])
def get_tip_by_category(category):
    if category in financial_tips:
        tip = random.choice(financial_tips[category])
        return jsonify({"tip": tip, "category": category})
    else:
        return jsonify({"error": "Category not found"}), 404

@app.route('/tips', methods=['POST'])
def add_tip():
    data = request.get_json()
    category = data.get("category")
    tip = data.get("tip")

    if category in financial_tips:
        financial_tips[category].append(tip)
        return jsonify({"message": "Tip added successfully"}), 201
    else:
        return jsonify({"error": "Invalid category"}), 400

if __name__ == '__main__':
    app.run(debug=True)
