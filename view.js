//---- Define your dialogs  and panels here ----
//testing

var thing = define_new_effective_permissions("permissionspanel", true, null)

var userthing = define_new_user_select_field("adduser", "Select User", function(selected_user){$('#permissionspanel').attr('username', selected_user)})

var infodialog = define_new_dialog(infodialog, 'Information permissions', {})
// ---- Display file structure ----

// $('#sidepanel').append(thing);
// $('#sidepanel').append(userthing);
$('#permissionspanel').attr('filepath', '/C')
$('.perm_info').click(function(){
    infodialog.dialog('open')
    let file = path_to_file[$('#permissionspanel').attr('filepath')]
    let user = all_users[$('#permissionspanel').attr('username')]
    let perm = $(this).attr('permission_name')
    console.log(perm)
    let explanation = allow_user_action(file, user, perm, true)
    let exp_string = get_explanation_text(explanation)
    infodialog.text(exp_string)
})

usertips = $('<br><div style="margin-left: 2vw; margin-right:2vw;"><h2>User Guide For Navigating Site</></>')
usertips.append($('<div>Read, write, and modify permissions can be found or editted by clicking the unlock button next to each file or folder.</>'))
usertips.append($('<div>To edit any other permissions for a user, such as delete or create files, click the following steps: Permissions button for the file whose permissions you are editting --> Advanced Permissions--> Edit Advanced Permissions --> Select User.</>'))
usertips.append($('<div>A grey checked box indicates an inherited permission from a parent file.</>'))

$('#wrapper').append(usertips)

filehierarchy = $('<br><div style="margin-left: 2vw; margin-right:2vw;"><h2>Order of Permission Precedance</></>')
filehierarchy.append($('<div>1. Direct permission to file or to a group the user is a part of</>'))
filehierarchy.append($('<div>2. Permission of parent folder, if inheritance is turned on, </>'))
filehierarchy.append($('<div>3. Permission of grandparent folder, etc.</>'))
filehierarchy.append($('<div>4. If the permission is not set directly, set in any ancestors or inheritance is off, it will default to deny</>'))

$('#wrapper').append(filehierarchy)

// (recursively) makes and returns an html element (wrapped in a jquery object) for a given file object
function make_file_element(file_obj) {
    let file_hash = get_full_path(file_obj)

    if(file_obj.is_folder) {
        let folder_elem = $(`<div class='folder' id="${file_hash}_div">
            <h3 id="${file_hash}_header">
                <span class="oi oi-folder" id="${file_hash}_icon"/> ${file_obj.filename} 
                <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                    Permissions <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/>
                </button>
            </h3>
        </div>`)

        // append children, if any:
        if( file_hash in parent_to_children) {
            let container_elem = $("<div class='folder_contents'></div>")
            folder_elem.append(container_elem)
            for(child_file of parent_to_children[file_hash]) {
                let child_elem = make_file_element(child_file)
                container_elem.append(child_elem)
            }
        }
        return folder_elem
    }
    else {
        return $(`<div class='file'  id="${file_hash}_div">
            <span class="oi oi-file" id="${file_hash}_icon"/> ${file_obj.filename}
            <button class="ui-button ui-widget ui-corner-all permbutton" path="${file_hash}" id="${file_hash}_permbutton"> 
                Permissions <span class="oi oi-lock-unlocked" id="${file_hash}_permicon"/> 
            </button>
        </div>`)
    }
}

for(let root_file of root_files) {
    let file_elem = make_file_element(root_file)
    $( "#filestructure" ).append( file_elem);    
}



// make folder hierarchy into an accordion structure
$('.folder').accordion({
    collapsible: true,
    heightStyle: 'content'
}) // TODO: start collapsed and check whether read permission exists before expanding?


// -- Connect File Structure lock buttons to the permission dialog --

// open permissions dialog when a permission button is clicked
$('.permbutton').click( function( e ) {
    // Set the path and open dialog:
    let path = e.currentTarget.getAttribute('path');
    perm_dialog.attr('filepath', path)
    if (path == '/C/presentation_documents') {
        perm_dialog.append(task2_advanced_expl_div)
    }
    perm_dialog.dialog('open')
    
    //open_permissions_dialog(path)

    // Deal with the fact that folders try to collapse/expand when you click on their permissions button:
    e.stopPropagation() // don't propagate button click to element underneath it (e.g. folder accordion)
    // Emit a click for logging purposes:
    emitter.dispatchEvent(new CustomEvent('userEvent', { detail: new ClickEntry(ActionEnum.CLICK, (e.clientX + window.pageXOffset), (e.clientY + window.pageYOffset), e.target.id,new Date().getTime()) }))
});


// ---- Assign unique ids to everything that doesn't have an ID ----
$('#html-loc').find('*').uniqueId() 