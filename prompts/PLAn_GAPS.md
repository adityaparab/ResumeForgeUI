## Gaps
These are the gaps in existing project.
- Refer to files `README.md`, `AGENTS.md`, `prompts/PLAN.md`, `docs/PROJECT_STRUCTURE.md`, and `TECH_STACK.md` to understand how this project is built and what it is doing.

### Before you start
- check for open github issues.
- Implement them first. One by one.
- When done, mark the issue as done on github and move on to the next one without waiting for permission.

#### Instructions

- Analyze following stages and create a github issue for each stage. Add detailed description, things to be convered with details, benefits and acceptance criteria.
- Once all the tasks are created on github, take each task one by one, complete it fully, and then immediately move on to the next task. Do not wait for permission to move to next task.
- When a task is completed, mark it as done on github before moving to next task. Update `prompts/PLAN.md` accordingly.
- For any newly added code, the test coverage should be 100% on ALL coverage metrics.
- e2e tests should be updated to reflect new changes.
- use `yarn build` to build the project and `yarn test` to run tests.

##### Stage 1
- Notification section should show ongoing analysis/resume extraction status
- Clicking on on going item in notification popover should navigate user to `analysis/stream/:analysisId` or `resume/stream/:resumeId` depending on what's going on.
- Show a notification toast when ongoing stream ends or errors out (should not dismiss automatically - user has to dismiss the toast manually.)

##### Stage 2
- On `/analysis` page, 
- in the list of analyses section, if the analysis is in progress, there should be a link to go to the `analysis/stream/:analysisId`. No other links should be there if analysis is in progress.
- `View Results` and `Interview Prep` buttons should be visible only on successul analysis.
- For failed analyses, show a link that takes the user to failure details screen.
- If user has no resume, instead of `New Analysis` component, show `Upload Resume` section. and when user submits the resume from here, navigate user to `/resume/stream/:resumeId`

##### Stage 3
- On `/resume` page, in the list of resumes section, if the resume extration is in progress, there should be a link to go to the `resume/stream/:resumeId`. No other links should be there if resume extraction is in progress. `View` button should show only for successful resume extration. For failed extrations, show a link that takes the user to failure details screen.


##### Stage 4
- On the stream display view
- The display section shows entire event object. instead it should append only the `chunk` property to the display. Make the output display view fit in the available screen height and have a scrollbar that follows the updating content. (so that the token that was recently added is alwaus displayed.)

##### Stage 5
- `/analysis/:analysisId` screen is completely broken.
- `/resume/:resumeId` screen
    - show resume download button only if the analysis results are available for given resume.
    - resume's `structuredContent` should be appropriately displayed on this screen.
    - User should be able to edit the rendered resume details. Best way would be to make each     rendered resume field is editable in-place.

##### Stage 6
- notification section at the top bar are not working.
- light/dark mode button not working.
- Dashboard screen - remove `Upload Resume` and `Analyze Resume` sections.

##### Stage 7
The UI looks very bland. Go throgh each and every component and figure out which existing `shadcn/ui` or `@ai-elements` from `shadcn/ui `components. Do not create and style native html elements such as div/inputs etc. by default. Check if equivalent componets exist, if not ONLY then use native html elements.
Use existing shadcn components instead of creating new divs and manually styling them Use the available `shadcn/ui` MCP server to figure out which component is best suited for the deature/component in question. Make the entire UI beautiful looking, professional, visually crisp, and modern.
