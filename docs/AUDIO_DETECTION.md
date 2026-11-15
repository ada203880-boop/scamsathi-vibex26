# Audio and voice-clone detection

## Current status: unavailable

ScamSathi does not accept, store, upload, play, or analyze audio. No audio-analysis API, model adapter, pretrained weights, dataset, inference service, or performance metrics are included. The interface directs users to verify an urgent caller through a trusted number instead.

This choice is deliberate: a generic speech-recognition model is not a voice-clone detector, and an unvalidated score could create false confidence. No claim is made that an audio file is authentic or cloned.

## Requirements before implementation

- Confirm a model's provenance, license, architecture, weights, supported languages, and inference requirements.
- Select a legally usable dataset and evaluate with speaker- and generator-disjoint splits, including unseen synthesis methods when possible.
- Report precision, recall, F1, ROC-AUC, false-positive rate, confusion matrix, recording condition, language, and calibration limitations.
- Implement an adapter boundary, strict file signature/MIME/size/duration checks, safe temporary-file handling, no raw audio logs, and deletion after inference.
- Keep playback and upload user-initiated; show analysis progress and uncertainty; never label a voice “real” or “fake” with certainty.

Until evaluation and privacy controls exist, the feature must remain unavailable and must not display an audio risk score.
