import json
import os

with open("package.json", "r") as file:
    packageFile = json.load(file)
    dependencies = packageFile.get("dependencies", {})
    devDependencies = packageFile.get("devDependencies", {})

    for package, version in dependencies.items():
        print(f"Checking for an update for {package} ({version.split("^")[1]})..")
        os.system(f"npm install {package}")
        print()

    for package, version in devDependencies.items():
        print(f"Checking for an update for {package} ({version.split("^")[1]})..")
        os.system(f"npm install {package} --save-dev")
        print()

print("Update finished!")
input("Press [Enter] to close the program.")