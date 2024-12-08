import json
import os

with open("package.json", "r") as file:
    packageFile = json.load(file) # Read file content.

    # Separate the dependencies and the dev dependencies.
    dependencies = packageFile.get("dependencies", {})
    devDependencies = packageFile.get("devDependencies", {})

    for package, version in dependencies.items(): # Create a loop for update every depencies.
        print(f"Checking for an update for {package} ({version.split("^")[1]})..", end = "\n\n")
        os.system(f"npm install {package}")

    for package, version in devDependencies.items():
        print(f"Checking for an update for {package} ({version.split("^")[1]})..", end = "\n\n")
        os.system(f"npm install {package} --save-dev")

print("Update finished!")
input("Press [Enter] to close the program.")