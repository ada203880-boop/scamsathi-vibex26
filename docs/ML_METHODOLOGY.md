# ML methodology and current status

## Current status: no ML model

The project does not train or run a fraud-prediction model. The engine uses explicit pattern rules and a weighted tally. The number shown is not a probability, confidence, or measured accuracy. No dataset, model weights, precision, recall, F1, ROC-AUC, PR-AUC, calibration, or confusion matrix is claimed.

There is no `ml/train.py`, `ml/evaluate.py`, or `ml/predict.py` because representative licensed training data and a validated pipeline are not available in this project. An empty or unvalidated model wrapper would misrepresent the product.

## Preconditions for a future model

1. Select a dataset with documented provenance and redistribution/use license; do not silently rehost restricted data.
2. Define threat labels and intended users; measure language, scam type, and time coverage.
3. Normalize labels and deduplicate exact and near-duplicate content before splitting.
4. Prefer time-aware and domain-aware splits; isolate the final test set from model selection.
5. Train a simple baseline before a larger model; record code version, data version, random seed, and parameters.
6. Report precision, recall, F1, ROC-AUC, PR-AUC, confusion matrix, false-positive/negative rates, subgroup results, and calibration where relevant.
7. Test drift and unseen scam templates; provide a model card and monitoring/deprecation plan.
8. Keep model predictions distinct from rule signals and show any aggregation formula to the user.

Until those steps are complete and independently reviewed, describe ScamSathi as an explainable rule-based prototype, not an AI fraud predictor.
