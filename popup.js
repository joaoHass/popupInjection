// Criando o alert
const accordionWrapper = document.createElement("div") // um wrapper para o alert, já que é preciso que o botão (accordionToggle) e o panel (acordionPanel) sejam siblings, não pai e filho
accordionWrapper.classList.add("accordion-wrapper")

const accordionToggle = document.createElement("button") // criando o botão que faz o toggle pra exibir/esconder a lista de tarefas rodando
accordionToggle.textContent = "Não existem cronômetros rodando! 😄"
accordionToggle.classList.add("accordion")

const accordionPanel = document.createElement("div") // criando a div que vai armazenar a lista de tarefas
accordionPanel.classList.add("accordion__panel", "is-hidden") // escondido por padrão

const accordionPanelItemList = document.createElement("ul")
accordionPanelItemList.classList.add(".accordion_panel__item")

accordionWrapper.appendChild(accordionToggle)
accordionWrapper.appendChild(accordionPanel)
accordionPanel.appendChild(accordionPanelItemList)
document.body.appendChild(accordionWrapper)

// muda o painel para visivel ou invisivel
// ref: https://www.w3schools.com/howto/howto_js_accordion.asp
accordionToggle.addEventListener("click", () => {
  accordionPanel.classList.toggle("is-hidden") // exibe/esconde o painel
  accordionToggle.classList.toggle("is-active")
  if (accordionPanel.style.maxHeight) {
    accordionPanel.style.maxHeight = null
  } else {
    accordionPanel.style.maxHeight = accordionPanel.scrollHeight + "px"
  }
})

// quando a página for carregada, procurar se ela existe no cache
// se não existe, inicializar ela vazia
// toda vez que a lista for atualizada, guardar no cache

// criando a array associativa e verificando se ela existe no localStorage
// se existe, pega ela, se não, cria uma vazia
let tasksRunning = {}

if (window.localStorage.getItem("tasksRunning")) {
  tasksRunning = JSON.parse(window.localStorage.getItem("tasksRunning"))
  renderPopup() // renderizando o popup

  // adicionando ícones no título dos cards das tasks que existem
  // essa parte do código foi adicionada aqui, específicamente, por quê a página recarrega sempre
  // que há mudanças na tasksRunning, então só preciso fazer a checagem uma vez por reload
  Object.keys(tasksRunning).forEach((id) => {
    // se a pessoa está numa url válida
    if (
      window.location.href.includes(
        "restrito.blancmarketingdigital.com.br/projects/tasks"
      )
    ) {
      // pegando o card com o id correspondente
      let taskCardText = document.querySelector(`a[data-edit="${id}"]`)

      // trocando o texto e adicionando um ⏰
      taskCardText.textContent = "⏰ " + taskCardText.textContent
    }
  })
}

//data-id
// quando o botão do timer for clicado, executar verificação
// se o timer ja havia sido iniciado, checa se existe na lista e remove
// se n tiver, checa se existe na lista antes (pro caso de desync ou sei la)
// se existir na lista, não faz nada, se não existir, adiciona
// baseado no data-task-id, pegar o nome da task nos cards de tasks
// todo card inclui a classe "card"
// iterar entre todos os cards e procurar qual tem o valor do data-id que bate com o data-task-id
// O QUE FAZER QUANDO FOREM ADICIONADOR NOVOS CARDS? RE-CALCULAR A VARIAVEL?
// acho que a pagina recarrega qnd é adicionado um novo card, o item acima n é um problema
// isso somente quando for adicionar, n faz sentido quando for excluir
//
let stopwatchButton = document.querySelector("#timer_btn") // botão do timer que fica no modal
let stopwatchButtonID = 0 // inicializando a variável

stopwatchButton.addEventListener("click", () => {
  stopwatchButtonID = stopwatchButton.attributes["data-task_id"].value // pega o id da task aberta atualmente

  // checagem de adição/remoção do objeto
  // se o cronometro tiver sido iniciado
  if (stopwatchButton.classList.contains("bg-danger")) {
    // excluindo a entrada do objeto lista
    delete tasksRunning[stopwatchButtonID]
    updateLocalStorageList(tasksRunning) // atualizando o localStorage
  } else {
    // concluido
    // fazer loop nos cards, achar o nome correspondente e adicionar entrada na tasksRunning
    let cards = document.querySelectorAll(".card") // pega todos os cards
    let cardTitle = loopTasks(stopwatchButtonID, [...cards]) // retorna o nome da task com nome correspondente
    tasksRunning[stopwatchButtonID] = cardTitle // adiciona o elemento na tasksRunning
    updateLocalStorageList(tasksRunning) // atualizando o localStorage
  }

  renderPopup() // re-renderizando a UI
  window.location.reload() // re-carregando a página para evitar problemas conhecidos
})

// concluido e debuggado
// loop pra encontrar o nome correspondente do id
// executar após confirmar que a tarefa não existe na tasksRunning
function loopTasks(idToSearch, arrayToSearch) {
  let i = 0
  for (i; i < arrayToSearch.length + 1; i++) {
    let card = arrayToSearch[i]
    if (card.hasAttribute("data-id")) {
      // trocar o value depois de modo que fique dinamico - OK
      if (card.attributes["data-id"].value === idToSearch) {
        return card.querySelector(".media-title").textContent
      }
    }
  }
}

// concluido
// função que cria uma nova UL e adiciona os li's baseado na tasksRunning
function createNewList(associativeArray, targetUL) {
  // clonando o elemento antigo, mas não sua subtree cloneNode(false)
  let newUL = targetUL.cloneNode(false)
  let child = newUL.firstElementChild
  while (child) {
    newUL.removeChild(child)
    child = newUL.firstElementChild
  }
  // baseado no conteudo da tasksRunning, crie elementos li e insira eles na
  let i = 0
  for (i; i < Object.keys(associativeArray).length; i++) {
    // criando o li
    let item = document.createElement("li")
    // definindo o conteúdo do li (texto)
    // https://stackoverflow.com/questions/31643204/textnode-or-textcontent
    item.textContent = Object.values(associativeArray)[i]
    item.addEventListener("click", () => {
      // verificando se o usuário está em uma página válida para o clique ocorrer
      if (
        window.location.href.includes(
          "restrito.blancmarketingdigital.com.br/projects/tasks"
        )
      ) {
        // verificando se o card existe ainda na página (no caso de poder ter sido excluído)
        if (
          document.querySelector(
            `a[data-edit="${Object.keys(associativeArray)[i - 1]}"]`
          )
        ) {
          console.log("clique interno")

          // pegando o card com o data-edit que tem o mesmo valor que o data-task_id da tarefa do li e simulando um click
          document
            .querySelector(`a[data-edit="${Object.keys(associativeArray)[i - 1]}"]`)
            .click()
        }
      } else {
        // caso não esteja numa página válida, avisar o user
        alert("Você precisa estar na página de tasks!")
      }
    })

    // inserindo na ul
    newUL.appendChild(item)
  }
  // adicionando novamente a classe
  newUL.classList.add(".accordion_panel__item")
  // retornando a lista de elementos li atualizada
  return newUL
}

function renderPopup() {
  // quando a UL é recriada mais abaixo, a referencia antiga ao objeto é perdida
  // portanto devemos re-selecionar a UL toda vez que a função é executada também
  let accordionPanelItemList = accordionPanel.querySelector("ul")

  // substitui a ul atual por uma nova, gerada usando a função createNewList
  accordionPanel.replaceChild(
    createNewList(tasksRunning, accordionPanelItemList),
    accordionPanel.querySelector("ul")
  )

  // checagem para re-renderizar a UI
  // fazendo loop na tasksRunning pra checar se existem entradas
  // se existirem entradas, então re-renderizar lista na UI do alert
  // todo: refatorar pra uma função que retorna o lenght, já que vai ter outra checagem
  // da mesma coisa no código, no caso quando a pessoa for sair da página
  if (Object.keys(tasksRunning).length > 0) {
    // altera o texto do toggle
    accordionToggle.textContent = "⏰ Existem cronômetros rodando!"
    // adiciona a classe que indica que existem tarefas rodando, para estilizar
    accordionWrapper.classList.add("has-active-tasks")

    // se existir somente um cronometro rodando, deixar texto no singular
    if (Object.keys(tasksRunning).length === 1) {
      // todo: um sorteador que escolhe entre frases aleatórias pro textinho
      accordionToggle.textContent = "⏰ Existe um cronômetro rodando!"
    }

    // checando se a UL está escondida, se estiver, mostrar ela
    if (accordionPanelItemList.classList.contains("is-hidden")) {
      accordionPanelItemList.classList.remove("is-hidden")
      console.log("removida")
    }
  } else {
    // se não existirem, então alterar o estilo do alert e o texto
    if (accordionWrapper.classList.contains("has-active-tasks")) {
      accordionWrapper.classList.remove("has-active-tasks")
      accordionToggle.textContent = "Não existem cronômetros rodando 😄"
      // escondendo a UL
      accordionPanelItemList.classList.add("is-hidden")
    }
  }
}

function updateLocalStorageList(listWhoReplace) {
  window.localStorage.setItem("tasksRunning", JSON.stringify(listWhoReplace))
}

// window.onbeforeunload = () => {
//   return Object.keys(tasksRunning).length > 0
//     ? "Existem cronômetros rodando ainda! ⏰"
//     : undefined
// }
