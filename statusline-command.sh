#!/usr/bin/env bash
# Claude Code status line script
# Shows: cwd | model | context usage | git branch

input=$(cat)

cwd=$(echo "$input" | jq -r '.workspace.current_dir // .cwd // ""')
model=$(echo "$input" | jq -r '.model.display_name // ""')
used=$(echo "$input" | jq -r '.context_window.used_percentage // empty')

# Shorten Windows home directory paths to ~
cwd=$(echo "$cwd" | sed 's|^/[cC]/Users/[^/]*/|~/|; s|\\|/|g')

# Git branch (skip optional locks to avoid hangs)
branch=""
if git -C "$cwd" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  branch=$(git -C "$cwd" --no-optional-locks symbolic-ref --short HEAD 2>/dev/null)
fi

# Build status line parts
parts="${cwd}"

if [ -n "$model" ]; then
  parts="${parts}  |  ${model}"
fi

if [ -n "$used" ]; then
  used_int=$(printf '%.0f' "$used")
  parts="${parts}  |  ctx: ${used_int}%"
fi

if [ -n "$branch" ]; then
  parts="${parts}  |  ${branch}"
fi

printf '%s' "$parts"
