
    fetch('https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-regioni.json')
    .then(response => response.json())
    .then(dati => {

    let sorted = dati.reverse()

    // console.log(sorted)

    let lastUpdated = sorted[0].data

    let lastUpdatedFormatted = lastUpdated.split('T')[0].split('-').reverse().join('/')
    document.querySelector('#data').innerHTML = lastUpdatedFormatted

    let lastUpdatedData = sorted.filter(el => el.data === lastUpdated).sort((a,b) => b.nuovi_positivi - a.nuovi_positivi)

    let totalCases = lastUpdatedData.map(el => el.totale_casi).reduce((t,n) => t+n)
    document.querySelector('#totalCases').innerHTML = totalCases

    let totalRecovered = lastUpdatedData.map(el => el.dimessi_guariti).reduce((t,n) => t+n)
    document.querySelector('#totalRecovered').innerHTML = totalRecovered
    
    let totalDeceased = lastUpdatedData.map(el => el.deceduti).reduce((t,n) => t+n)
    document.querySelector('#totalDeceased').innerHTML = totalDeceased
    
    let totalPositive = lastUpdatedData.map(el => el.totale_positivi).reduce((t,n) => t+n)
    document.querySelector('#totalPositive').innerHTML = totalPositive


    let cardWrapper = document.querySelector('#cardWrapper')
    let progressWrapper = document.querySelector('#progressWrapper')
    let todayMax = Math.max(...lastUpdatedData.map(el=>el.nuovi_positivi))

    lastUpdatedData.forEach(el => {
        let div = document.createElement('div')
        div.classList.add('col-12', 'col-md-6', 'my-4')
        div.innerHTML = 
        `
            <div class="card-custom p-3 pb-0 h-100 pointer" data-region="${el.denominazione_regione}">
                <p class= h5 mb-4">${el.denominazione_regione}</p>
                <p class="text-right h4 mb-0">${el.nuovi_positivi}</p>
            </div>
                
        `
        cardWrapper.appendChild(div)

        let bar = document.createElement('div')
        bar.classList.add('col-12', 'mb-5')
        bar.innerHTML = 
        `
            <p class="mb-0 text-light">${el.denominazione_regione}: ${el.nuovi_positivi}</p>
            <div class="progress">
                <div class="progress-bar rounded" style="width: ${100*el.nuovi_positivi/todayMax}%;">
                </div>
            </div>
        
        `
        progressWrapper.appendChild(bar)
    });

    let modal = document.querySelector('.modal-custom')
    let modalContent = document.querySelector('.modal-custom-content')

    document.querySelectorAll('[data-region').forEach(el=>{
        el.addEventListener('click', ()=>{
            let region = el.dataset.region
            modal.classList.add('active')
            let dataAboutRegion = lastUpdatedData.filter(el=>el.denominazione_regione == region)[0]
            modalContent.innerHTML = 
            `
                <div class="row">
                    <div class="col-12 px-auto">
                        <p class="float-right lead"><i id="closure" class="fas fa-times pointer"></i></p>
                        <p class="h2 text-main">${dataAboutRegion.denominazione_regione}</p>
                    </div>
                </div>
                <div class="container px-2 px-md-3">
                    <div class="row pt-3 mx-auto mb-3">
                        <div class="col-6 col-md-3 text-center px-1 px-md-2">
                            <p class="lead">Nuovi positivi: </p>
                            <p class="h4 text-danger d-block d-md-inline">${dataAboutRegion.nuovi_positivi}</p>
                        </div>
                        <div class="col-6 col-md-3 text-center px-1 px-md-2">
                            <p class="lead">Decessi: </p>
                            <p class="h4 text-danger d-block d-md-inline">${dataAboutRegion.deceduti}</p>
                        </div>
                        <div class="col-6 col-md-3 text-center px-1 px-md-2">
                            <p class="lead">Guariti: </p>
                            <p class="h4 text-danger d-block d-md-inline">${dataAboutRegion.dimessi_guariti}</p>
                        </div>
                        <div class="col-6 col-md-3 text-center px-1 px-md-2">
                            <p class="lead">Ricoverati: </p>
                            <p class="h4 text-danger d-block d-md-inline">${dataAboutRegion.ricoverati_con_sintomi}</p>
                        </div>
                    </div>
                    <div class="row ">
                        <div class="col-12 mt-1">
                            <canvas id="positiveTrend" width="400" height="400"></canvas>
                        </div>
                    </div>

                </div>

            `
            let trendData = sorted.map(el=>el).reverse().filter(el=>el.denominazione_regione == region).map(el=>[el.data, el.nuovi_positivi, el.deceduti, el.dimessi_guariti])

            
    
            let maxNew = Math.max(...trendData.map(el => el[1]))
            let maxDeath = Math.max(...trendData.map(el => el[2]))
            let maxRecovered = Math.max(...trendData.map(el => el[3]))

            var positiveTrend = document.getElementById('positiveTrend').getContext('2d');
            var chartPositiveTrend = new Chart(positiveTrend, {
                // The type of chart we want to create
                type: 'line',

                // The data for our dataset
                data: {
                    labels: trendData.map(el=>el[0].split('T')[0].split('-').reverse().join('/')),
                    datasets: [{
                        label: 'Positivi',
                        backgroundColor: 'rgba(0, 0, 255, 0.1)',
                        borderColor: 'rgba(0, 0, 255, 0.3)',
                        data: trendData.map(el => el[1])
                    },
                    {
                        label: 'Deceduti',
                        backgroundColor: 'rgba(255, 0, 0, 0.1)',
                        borderColor: 'rgba(255, 0, 0, 0.3)',
                        data: trendData.map(el => el[2])
                    },
                    {
                        label: 'Guariti',
                        backgroundColor: 'rgba(3, 150, 3, 0.1)',
                        borderColor: 'rgba(3, 150, 3, 0.3)',
                        data: trendData.map(el => el[3])
                    }
                ]
                },

                // Configuration options go here
                options:  {
                    responsive: true,
                    maintainAspectRatio: false,
                }
            });

        })
    })

    window.addEventListener('click', function(e){
        let closure = document.querySelector('#closure')
        if(e.target == modal || e.target == closure){
            modal.classList.remove('active')
        }
    })

    let days = Array.from(new Set(sorted.map(el=>el.data))).reverse()
    document.querySelectorAll('[data-trend').forEach(el=>{
        el.addEventListener('click', ()=>{
            let set = el.dataset.trend
            let totalPerDays = days.map(el=>[el,sorted.filter(i=>i.data == el).map(e=>e[set]).reduce((t,n)=>t+n)])
            let maxData = Math.max(...totalPerDays.map(el=>el[1])) 
            modal.classList.add('active')
            modalContent.innerHTML = 

            `   <div class="row">
                    <div class="col-12 px-auto mb-3">
                        <p class="float-right lead"><i id="closure" class="fas fa-times pointer"></i></p>
                        <p class="h2 text-main">${set.replace(/_/g," ").toUpperCase()}</p>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12 mb-2 pl-4">
                        <canvas id="totalTrend" width="400" height="400"></canvas>
                    </div>
                </div>        
                
            `

            let dataTrend = totalPerDays.map(el=>el[1])
            let dateTrend = totalPerDays.map(el=>el[0].split('T')[0].split('-').reverse().join('/'))

            var totalTrend = document.getElementById('totalTrend').getContext('2d');
            var charttotalTrend = new Chart(totalTrend, {
                // The type of chart we want to create
                type: 'line',

                // The data for our dataset
                data: {
                    labels: dateTrend,
                    datasets: [{
                        label: set.replace(/_/g," ").toUpperCase(),
                        backgroundColor: 'rgba(0, 0, 255, 0.1)',
                        borderColor: 'rgba(0, 0, 255, 0.3)',
                        data: dataTrend
                    },
                ]
                },

                // Configuration options go here
                options:  {
                    responsive: true,
                    maintainAspectRatio: false,
                }
            });
        })
    })

    let pieTrigger = document.querySelector('#pieTrigger')
    pieTrigger.addEventListener('click', ()=>{
        modal.classList.add('active')
        modalContent.innerHTML = 
        `
            <div class="row">
                <div class="col-12 px-auto mb-3">
                    <p class="float-right lead"><i id="closure" class="fas fa-times pointer"></i></p>
                    <p class="h2 text-main">Situazione attuale</p>
                </div>
            </div>
            <div class="row">
                <div class="col-12 mb-2">
                    <canvas id="pieChart" width="400" height="600" ></canvas>
                </div>
            </div>
           
        `
        let newPositive = lastUpdatedData.map(el=>el.nuovi_positivi)
        let newRegion = lastUpdatedData.map(el=>el.denominazione_regione)
        
        var pieChart = document.getElementById('pieChart').getContext('2d');
        var pieChart = new Chart(pieChart, {
            type: 'doughnut',
            data: {
                labels: newRegion,
                datasets: [{
                    label:'ciaone',
                    backgroundColor: ['#D7263D', '#F46036','#2E294E','#1B998B','#C5D86D','#DDE8B9','#E8D2AE','#D7B29D','#CB8589','#796465','#E9FAE3','#DEE8D5','#D5C7BC','#AC92A6','#77B6EA','#D90368','#37393A','#820263','#2E294E','#FFD400','#92140C',],
                    borderColor: '#f0efef',
                    data: newPositive,
                }]
            },

            options:  {
                responsive: true,
                maintainAspectRatio: false,
                legend:{
                    display: true,
                    position: 'bottom'                   
                }
            }
        });
    })
})
