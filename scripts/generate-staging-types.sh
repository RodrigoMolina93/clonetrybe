#!/usr/bin/env bash
set -euo pipefail

project_ref_file="supabase/.temp/project-ref"
target_file="src/types/database.ts"

if [[ -z "${PUMM_SUPABASE_PROJECT_REF:-}" ]]; then
  echo "Set PUMM_SUPABASE_PROJECT_REF to the approved PUMM staging project ref."
  exit 1
fi

if [[ ! -f "$project_ref_file" ]]; then
  echo "Supabase staging is not linked. Run: supabase link --project-ref <staging-project-ref>"
  exit 1
fi

linked_project_ref="$(tr -d '[:space:]' < "$project_ref_file")"
if [[ "$linked_project_ref" != "$PUMM_SUPABASE_PROJECT_REF" ]]; then
  echo "Refusing to generate types: the linked project is not the approved PUMM staging project."
  exit 1
fi

temporary_file="$(mktemp)"
trap 'rm -f "$temporary_file"' EXIT

supabase gen types typescript --linked --schema public > "$temporary_file"

if [[ ! -s "$temporary_file" ]]; then
  echo "Supabase returned an empty type definition. Existing types were preserved."
  exit 1
fi

mv "$temporary_file" "$target_file"
trap - EXIT
echo "Generated database types from linked Supabase staging schema."
