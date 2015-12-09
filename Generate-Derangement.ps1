<#
.SYNOPSIS
Generates a mathematical derangement for a given list
.DESCRIPTION
This script generates random permutations until a valid derangement is found. It requires a list of elements for which equality (-eq) makes sense.
.EXAMPLE
Generate-Derangement.ps1 (1..20)
.PARAMETER List
The list for which a derangement must be generated
#>

##-[ Parameters ]-##

Param(
    [Parameter(
        Mandatory=$true,
        HelpMessage='The list for which a derangement must be generated')]
    [Object[]]
    $list
)

##-[ Setup ]-##

# Enforce use of strict mode
Set-StrictMode -Version Latest

##-[ Functions ]-##

# Randomly permute a list
function Permute-List () {

    Param(
        [Parameter(
            Mandatory=$true,
            HelpMessage='The list which must be permutated')]
        [Object[]]
        $l
    )
    
    $r = New-Object System.Random

    # Generate a random value for each list item, and sort based on this
    return $l | ForEach-Object {

        # Save the original content of the list, and associate a random value with it
        $o  = New-Object psobject
        Add-Member -InputObject $o -MemberType NoteProperty -Name 'key'  -Value $_
        Add-Member -InputObject $o -MemberType NoteProperty -Name 'rand' -Value $r.Next()
        
        $o

    } | Sort-Object -Property 'rand' | ForEach-Object {
        
        # Just return the original value
        $_.key

    }
}

# Check we have a derangement (mathematical name for "nobody ends in the position it starts in")
# See https://en.wikipedia.org/wiki/Derangement
function Check-Derangement () {

    Param(
        [Parameter(
            Mandatory=$true,
            HelpMessage='The original list')]
        [Object[]]
        $l1,
        [Parameter(
            Mandatory=$true,
            HelpMessage='The list permutated list')]
        [Object[]]
        $l2
    )

    # Basic check: list have the same length
    if ($l1.length -ne $l2.length) {
        return $false
    }

    # Check no element of the list is in the same position in the new list
    for ($i = 0; $i -lt $l1.length; $i++) {

        if ($l1[$i] -eq $l2[$i]) {
            return $false
        }

    }

    return $true
}

# Generate permutations until we get a derangement (with approximate probability 1/e = 0.36)
function Get-Derangement () {

    Param(
        [Parameter(
            Mandatory=$true,
            HelpMessage='The list for which a derangement must be generated')]
        [Object[]]
        $l
    )

    # Repeat until true!
    Do {

        $p = Permute-List $l

    } Until (Check-Derangement $l $p)

    $p
}

# Convert something looking like valid JavaScript (works well for integers)
function Convert-ListsToJS () {

    Param(
        [Parameter(
            Mandatory=$true,
            HelpMessage='The original list')]
        [Object[]]
        $l1,
        [Parameter(
            Mandatory=$true,
            HelpMessage='The permutated list')]
        [Object[]]
        $l2
    )
    
    # Basic check: list have the same length
    if ($l1.length -ne $l2.length) {
        return $false
    }

    #Output the list as a valid JavaScript array
    $out="{"

    $l1 | ForEach-Object {

        $out = $out + $_ + ": " + $l2[$_-1] + ", "

    }

    $out.TrimEnd(", ") + "};"

}

# Generate a derangement and output as simili-JS
$p = Get-Derangement $list
Convert-ListsToJS $list $p
