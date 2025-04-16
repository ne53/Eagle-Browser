function getFolderData() {
  return fetch('http://localhost:5000/api/folder/list')
    .then(res => res.json());
}

function displayFolders() {
  getFolderData()
    .then(folderData => {
      const container = document.createElement('div');
      folderData.data.forEach(folder => {
        const folderDiv = document.createElement('div');
        const img = document.createElement('img');
        img.src = "/file.svg";
        img.alt = "Folder icon";
        img.width = 48;
        img.height = 48;
        const p = document.createElement('p');
        p.textContent = folder.name;
        folderDiv.appendChild(img);
        folderDiv.appendChild(p);
        container.appendChild(folderDiv);
      });
      document.getElementById('folder-container').appendChild(container);
    });
}

function Home() {
  return (
    <div id="folder-container">
      <script>{displayFolders()}</script>
    </div>
  );
}

export default Home;
