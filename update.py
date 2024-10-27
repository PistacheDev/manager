import json
import platform
import os

with open('package.json', 'r') as file:
    packageFile = json.load(file) # Read file content.

    # Separate the dependencies and the dev dependencies.
    dependencies = packageFile.get('dependencies', {})
    devDependencies = packageFile.get('devDependencies', {})

    for package, version in dependencies.items(): # Create a loop for update every depencies.
        print(f'Checking for an update for {package} ({version.split('^')[1]})..')
        os.system(f'npm install {package}')
        os.system('cls' if platform.system() == 'Windows' else 'clear')

    for package, version in devDependencies.items(): # Same but with the dev depencies.
        print(f'Checking for an update for {package} ({version.split('^')[1]})..')
        os.system(f'npm install {package} --save-dev')
        os.system('cls' if platform.system() == 'Windows' else 'clear')

print('Update finished!')
input('Press [Enter] to close the program.')