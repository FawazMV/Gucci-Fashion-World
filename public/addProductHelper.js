const brandModel = require('../models/brandName-schema')
const adminModel = require('../models/admin-schema');
const genderModel = require('../models/gender_type-schema');
const { s3Uploadv2, s3Uploadv3, s3delte2, s3delte3 } = require('../config/s3Service')


$(".gambar").attr("src", "https://user.gadjian.com/static/images/personnel_boy.png");
var $uploadCrop,
    tempFilename,
    rawImg,
    imageId;
function readFile(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('.upload-demo').addClass('ready');
            $('#cropImagePop').modal('show');
            rawImg = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
    else {
        swal("Sorry - you're browser doesn't support the FileReader API");
    }
}

$uploadCrop = $('#upload-demo').croppie({
    viewport: {
        width: 160,
        height: 200,
    },
    enforceBoundary: false,
    enableExif: true
});
$('#cropImagePop').on('shown.bs.modal', function () {
    // alert('Shown pop');
    $uploadCrop.croppie('bind', {
        url: rawImg
    }).then(function () {
        console.log('jQuery bind complete');
    });
});

$('.item-img').on('change', function () {
    imageId = $(this).data('id'); tempFilename = $(this).val();
    $('#cancelCropBtn').data('id', imageId); readFile(this);
});
$('#cropImageBtn').on('click', function (ev) {
    $uploadCrop.croppie('result', {
        type: 'base64',
        format: 'jpeg',
        size: { width: 150, height: 200 }
    }).then(function (resp) {
        console.log(resp)
        let imageFile = urltofile(resp)
        uploadImage(imageFile)
        $('#item-img-output').attr('src', resp);
        $('#cropImagePop').modal('hide');
    });
});

urltofile = (url) => {
    let arr = url.split(',');
    let mime = arr[0].match(/:(.*?);/)[1]
    let data = arr[1]
    let dataStr = atob(data)
    let n = dataStr.length
    let dataArr = new Uint8Array(n)
    while (n--) {
        dataArr[n] = dataStr.charCodeAt(n)
    }
    let file = new File([dataArr], 'File.jpg', { type: mime })
    return file
}
let arr = [];
let uploadImage = (file) => {
    let formData = new FormData()
    console.log(file)
    // let a = arr.length
    // arr[a] = file
    // console.log(arr)
    //let formData = document.getElementById('formFileLg')
    //let a = formData.files.length
    //formData.files[a]=file
    var imagefile = document.querySelector('#abcdefa');
    formData.append("image", imagefile.files[0]);
    // formData.append('file', file)
    confirm('fasdfsad')
    axios.post('/upload_file', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })

}