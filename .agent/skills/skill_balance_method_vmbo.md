
# AntiGravity Skill: VMBO Balance Equation Tutor

## Purpose
Build a highly visual interactive module that teaches solving linear equations using the **balance method**.

Target group: VMBO Kader 2 students.

The core metaphor is a **physical balance scale**. Any operation applied to one side must also be applied to the other side.

The module must prioritize:
- visual reasoning
- step‑by‑step transformations
- decreasing scaffolding
- color-coded algebra steps

## Pedagogical Model

Learning phases:

1. Guided Example 1 (very easy)
2. Guided Example 2 (medium)
3. Guided Example 3 (normal VMBO Kader level)
4. Practice Mode

Support level gradually decreases.

### Example progression

Example 1
x + 3 = 7

Example 2
2x + 5 = 13

Example 3
3x - 4 = 11


## Visual Rules

### Colors

Equation text: BLUE  
Operations applied: RED  
Resulting new equation: BLUE (next line)

Example layout:

x + 3 = 7
-3        -3   (RED)
-------------------
x = 4

### Layout direction

All work must appear **vertically downward**.

Each operation creates a **new line below the previous one**.

## Balance Visualization

A large balance scale is always visible.

Left plate = left side of equation  
Right plate = right side of equation  

### Visual Elements

Variable block (x)
Number blocks (weights)

### Behavior

If equation is correct:
balance stays horizontal

If learner proposes incorrect step:
scale tilts toward heavier side

Animation duration: ~600ms

## Learning Flow

### Phase 1: Guided Example

Teacher mode explanation text.

Step prompts:
"What should we remove first?"

Hints visible.

### Phase 2: Semi-guided

Hints reduced.

Students must choose correct operation.

### Phase 3: Practice

Student decides:

Step 1: remove variables from one side  
Step 2: remove constants  

Goal: reach form

ax = b

then

x = b/a


## Interaction Model

Student selects an operation:

- subtract number
- add number
- divide
- multiply

The system checks validity.

If correct:
animate operation on both sides.

If incorrect:
show tilt animation + explanation.

## Equation Engine

Equation structure:

{
 left: expression[],
 right: expression[]
}

Example:

{
 left: ["x","+","3"],
 right: ["7"]
}

Operations modify both sides simultaneously.

## Balance Tilt Logic

Compute numeric weight of both sides.

If left > right
tilt left

If right > left
tilt right


## Components

BalanceScale.jsx
EquationColumn.jsx
StepRenderer.jsx
OperationSelector.jsx
ExampleMode.jsx
PracticeMode.jsx


## Difficulty System

Level 1
x + a = b

Level 2
x - a = b

Level 3
ax + b = c

Level 4
ax + b = cx + d


## Feedback System

Correct:
green confirmation
scale stabilizes

Incorrect:
scale tilts
explanation text appears


## UX Principles

- Large readable algebra
- Strong color contrast
- Minimal text
- Immediate visual feedback


## Success Criteria

A student can independently solve equations of the form:

ax + b = c

using the balance method.
