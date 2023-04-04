import os

if __name__ == "__main__":
    os.system("flask --app api init-db")
    os.system("flask --app api run --debug")
