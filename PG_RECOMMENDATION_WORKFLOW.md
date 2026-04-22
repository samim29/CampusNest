# PG Recommendation System Workflow

This workflow connects your current notebook pipeline, backend API, and React frontend into one end-to-end recommendation system.

## 1) End-to-End Flow

```mermaid
flowchart TD
    A[Phase 1: Synthetic Data Generation\nPG + Student + Interaction CSVs] --> B[Phase 2: Feature Engineering\nMerge + budget_surplus + matches]
    B --> C[Group-Aware Split by student_id]
    C --> D[Train LightGBM LGBMRanker\nobjective=lambdarank]
    D --> E[Evaluate\nFeature Importance + NDCG Curve]
    D --> F[Persist Model\nhybrid_pg_ranker.pkl]

    F --> G[Model Serving Layer\nrecommend_for_student]
    G --> H[Backend Endpoint\nGET /api/recommendations/:student_id]
    H --> I[Frontend Data Hook\nuseRecommendations(studentId)]
    I --> J[UI Rendering\nRanked PG cards + explanations]
```

## 2) Current Files and Their Roles

### Data Science / Training
- Notebook: outside workspace (PG_Recommendation_System.ipynb)
  - Generates `pg_listings.csv`, `student_profiles.csv`, `interactions.csv`
  - Trains LightGBM ranker
  - Plots model behavior
  - Saves `hybrid_pg_ranker.pkl`

### Backend API
- `api/app.py`
  - Auth, profile, PG, college, search routes
  - Needs recommendation route integration
- `api/database.py`
  - ORM schema: users, colleges, pg_listings
  - Base for pulling live candidate PGs and user profile features

### Frontend
- `src/hooks/useApi.js`
  - Existing query hooks (PGs, user, colleges)
  - Needs `useRecommendations` hook
- `src/pages/PGListings.jsx`
  - Listing UI and filtering
  - Can switch from generic list to ranked recommendation list for logged-in student
- `src/config/appConfig.js`
  - `USE_DATABASE` flag controls static vs live data mode
- `src/data/staticData.js`
  - fallback dataset when DB mode is disabled

## 3) Detailed Workflow for Your Current Code

### Step A: Generate training datasets
1. Create PG metadata with price and amenities.
2. Create student profiles with budget, commute, and preferences.
3. Compute geospatial distance using Haversine.
4. Sample student-PG interactions.
5. Build synthetic rating signal from budget, distance, amenities, and noise.
6. Export CSV files.

### Step B: Train ranking model
1. Load the CSVs.
2. Merge interaction + student + PG context.
3. Engineer relationship features:
   - `budget_surplus`
   - `ac_match`
   - `food_match`
4. Sort by `student_id` and `pg_id` (required for LightGBM ranking groups).
5. Split by unique users (prevents leakage).
6. Train `LGBMRanker` with `lambdarank` objective.
7. Early stopping + logs.
8. Save model as `hybrid_pg_ranker.pkl`.

### Step C: Inference (recommendation generation)
1. Input: one target student profile + PG candidate set.
2. Recreate the same training features.
3. Predict relevance score for each PG.
4. Rank descending by prediction.
5. Return top K (for example K=10).

### Step D: Product integration
1. Backend loads model once at startup.
2. Add endpoint: `GET /api/recommendations/<student_id>?top_k=10`.
3. Endpoint fetches user + candidate PGs from DB.
4. Endpoint computes features and runs model scoring.
5. Frontend calls endpoint via React Query hook.
6. UI displays ranked cards and reason tags (budget fit, AC match, food match, distance).

## 4) Data Contract for Recommendation Endpoint

### Request
- Path param: `student_id`
- Query param: `top_k` (optional, default 10)

### Response (example)
```json
{
  "student_id": 42,
  "top_k": 5,
  "recommendations": [
    {
      "pg_id": 113,
      "score": 2.943,
      "rank": 1,
      "explanations": ["within_budget", "ac_match", "near_college"]
    }
  ]
}
```

## 5) Critical Consistency Rules

1. Feature names and order during inference must exactly match training:
   - `distance_to_college_km`
   - `price_inr`
   - `budget_surplus`
   - `has_ac`
   - `has_food`
   - `has_wifi`
   - `ac_match`
   - `food_match`
2. Any missing values must be handled consistently.
3. Keep model artifact versioned (for example: `hybrid_pg_ranker_v1.pkl`).
4. Re-train if scoring logic or feature definitions change.

## 6) Suggested Implementation Sequence

1. Keep notebook pipeline as the offline trainer.
2. Add a small Python inference utility module in backend (load model, build feature frame, predict).
3. Add recommendations endpoint in `api/app.py`.
4. Add `useRecommendations(studentId, topK)` hook in `src/hooks/useApi.js`.
5. Add “Recommended for You” section in `src/pages/PGListings.jsx`.
6. Test in static mode first, then DB mode.

## 7) Minimal Validation Checklist

- Model file loads successfully.
- Endpoint returns ranked list for known student.
- Top-K results are deterministic with fixed model and input.
- Frontend handles loading/empty/error states.
- If recommendation API fails, UI falls back to regular PG listing.
