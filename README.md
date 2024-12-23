Description
This project allows you to:

Filter cats by country using a search field or by clicking on country flags.
Dynamically add new cats to the list of cards.
Mark or unmark cats as favorites using a star-shaped button.
Reset the form to its initial state.
Hide and show the form according to user needs.
Features
Dynamic Filtering
Search for cats by country in real-time.
Flags allow for quick filtering.
Add Cats
Users can simulate adding new cats via a form.
Cards are dynamically generated with the entered information.
Favorite Management
Each cat has a star button to mark or unmark it as a favorite.
Favorites are managed on the frontend.
Interactive Form
Resets to default values with a reset button.
Can be hidden to optimize the user interface.
Requirements
A compatible web browser (Chrome, Firefox, Edge, etc.).
Access to a cat API (either simulated or real, depending on the development environment).
Technologies Used
Frontend
HTML, CSS, and JavaScript.
Bootstrap framework for responsive design.
Icons from Bootstrap Icons or Font Awesome.
API (Simulated)
Initial data is fetched via a GET request.
Installation
1. Clone the Repository
Download the source code of the Angular project from the repository. Open your terminal and run:

bash
Copiar código
git clone https://github.com/yourusername/angular-cat-project.git
Replace https://github.com/yourusername/angular-cat-project.git with the actual URL of your repository.

2. Access the Project Directory
Change the current directory to the cloned project:

bash
Copiar código
cd angular-cat-project
3. Install Node.js and npm
Ensure you have Node.js installed. You can check with:

bash
Copiar código
node -v
npm -v
If they are not installed, download and install them from Node.js. The Node.js installation includes npm.

4. Install Angular CLI (if not already installed)
If you don’t have Angular CLI installed globally, install it using the following command:

bash
Copiar código
npm install -g @angular/cli
Verify the installation with:

bash
Copiar código
ng version
5. Install Dependencies
Run the following command inside the project directory to install all required dependencies listed in the package.json file:

bash
Copiar código
npm install
6. Configure Environment Variables (optional)
If your project uses specific configurations, such as API keys or settings for different environments, make sure to set up the necessary variables. This may involve:

Editing an environment.ts file.
Creating a .env file according to the project instructions.
7. Start the Development Server
Start the development server to view the project in your browser. Use:

bash
Copiar código
ng serve
